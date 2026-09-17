import { createClient, isSupabaseConfigured, CommunityPostItem, CommunityComment, CommunityProfile } from '@/src/lib/supabase';

/**
 * Fetch live public posts directly from Supabase with relational profiles,
 * exact likes count, comments count, and the current user's like status.
 * Strictly 0 mock/dummy data. If the database is empty, returns an empty array.
 *
 * NOTE: To prevent PostgREST "Could not embed because more than one relationship was found"
 * errors caused by multiple foreign keys between posts/comments and profiles in user databases,
 * we query posts, comments, likes, and profiles in decoupled, high-performance batch queries.
 */
export async function fetchCommunityPosts(currentUserId?: string | null): Promise<CommunityPostItem[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured. Community relies 100% on live Supabase data.');
    return [];
  }

  const supabase = createClient();
  try {
    // 1. Fetch live posts directly without nested embed to avoid ambiguous relation errors
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('id, user_id, content, image_url, created_at')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Supabase fetch posts error:', postsError.message);
      return [];
    }

    if (!postsData || postsData.length === 0) {
      return [];
    }

    const postIds = postsData.map((p) => p.id);

    // 2. Fetch live likes and live comments in parallel for maximum speed
    const [likesResult, commentsResult] = await Promise.all([
      supabase
        .from('likes')
        .select('post_id, user_id')
        .in('post_id', postIds),
      supabase
        .from('comments')
        .select('id, post_id, user_id, content, created_at')
        .in('post_id', postIds)
        .order('created_at', { ascending: true }),
    ]);

    if (likesResult.error) {
      console.warn('Supabase fetch likes error:', likesResult.error.message);
    }
    if (commentsResult.error) {
      console.warn('Supabase fetch comments error:', commentsResult.error.message);
    }

    const likesData = likesResult.data || [];
    const commentsData = commentsResult.data || [];

    // 3. Collect all distinct user IDs from posts and comments to fetch profiles in one batch
    const allUserIds = Array.from(
      new Set([
        ...postsData.map((p) => p.user_id),
        ...commentsData.map((c) => c.user_id),
      ].filter(Boolean))
    );

    const profilesMap: Record<string, CommunityProfile> = {};
    if (allUserIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, role, avatar_url')
        .in('id', allUserIds);

      if (profilesError) {
        console.warn('Supabase fetch profiles error:', profilesError.message);
      } else if (profilesData) {
        profilesData.forEach((prof: any) => {
          profilesMap[prof.id] = {
            id: prof.id,
            full_name: prof.full_name,
            username: prof.username,
            role: prof.role || 'Eco Warrior',
            avatar_url: prof.avatar_url,
          };
        });
      }
    }

    // Exact Likes map & user-liked set
    const likesCountMap: Record<string, number> = {};
    const userLikedSet = new Set<string>();

    likesData.forEach((like) => {
      likesCountMap[like.post_id] = (likesCountMap[like.post_id] || 0) + 1;
      if (currentUserId && like.user_id === currentUserId) {
        userLikedSet.add(like.post_id);
      }
    });

    // Group live comments by post_id with attached profiles
    const commentsMap: Record<string, CommunityComment[]> = {};
    commentsData.forEach((comment: any) => {
      if (!commentsMap[comment.post_id]) {
        commentsMap[comment.post_id] = [];
      }

      const commentAuthor = profilesMap[comment.user_id] || {
        id: comment.user_id,
        full_name: 'Eco Warrior',
        username: `eco_${comment.user_id.slice(0, 6)}`,
        role: 'Eco Warrior',
        avatar_url: null,
      };

      commentsMap[comment.post_id].push({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        profiles: commentAuthor,
      });
    });

    // Combine posts with their respective author profile, likes count, and comments
    return postsData.map((post: any) => {
      const postComments = commentsMap[post.id] || [];
      const postAuthor = profilesMap[post.user_id] || {
        id: post.user_id,
        full_name: 'Eco Warrior',
        username: `eco_${post.user_id.slice(0, 6)}`,
        role: 'Eco Warrior',
        avatar_url: null,
      };

      return {
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        image_url: post.image_url,
        created_at: post.created_at,
        profiles: postAuthor,
        likes_count: likesCountMap[post.id] || 0,
        comments_count: postComments.length,
        is_liked: userLikedSet.has(post.id),
        comments: postComments,
      };
    });
  } catch (err) {
    console.error('Exception fetching live community posts:', err);
    return [];
  }
}

/**
 * Fetch live comments directly from public.comments filtered strictly by post_id
 */
export async function fetchPostComments(postId: string): Promise<CommunityComment[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  try {
    const { data: commentsData, error } = await supabase
      .from('comments')
      .select('id, post_id, user_id, content, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching live post comments:', error.message);
      return [];
    }

    if (!commentsData || commentsData.length === 0) return [];

    const userIds = Array.from(new Set(commentsData.map((c: any) => c.user_id).filter(Boolean)));
    const profilesMap: Record<string, CommunityProfile> = {};

    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, username, role, avatar_url')
        .in('id', userIds);

      (profilesData || []).forEach((prof: any) => {
        profilesMap[prof.id] = {
          id: prof.id,
          full_name: prof.full_name,
          username: prof.username,
          role: prof.role || 'Eco Warrior',
          avatar_url: prof.avatar_url,
        };
      });
    }

    return commentsData.map((c: any) => ({
      id: c.id,
      post_id: c.post_id,
      user_id: c.user_id,
      content: c.content,
      created_at: c.created_at,
      profiles: profilesMap[c.user_id] || {
        id: c.user_id,
        full_name: 'Eco Warrior',
        username: `eco_${c.user_id.slice(0, 6)}`,
        role: 'Eco Warrior',
        avatar_url: null,
      },
    }));
  } catch (err) {
    console.error('Exception fetching post comments:', err);
    return [];
  }
}

/**
 * Create a new Post directly in public.posts with authenticated session user_id
 */
export async function createCommunityPost(params: {
  userId: string;
  content: string;
  imageUrl?: string | null;
  authorProfile?: CommunityProfile | null;
}): Promise<{ success: boolean; post?: CommunityPostItem; error?: string }> {
  const { userId, content, imageUrl, authorProfile } = params;

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Koneksi Supabase belum terkonfigurasi. Postingan tidak dapat disimpan.',
    };
  }

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content: content.trim(),
        image_url: imageUrl?.trim() || null,
      })
      .select('id, user_id, content, image_url, created_at')
      .single();

    if (error) {
      console.error('Supabase insert post failed:', error.message);
      return { success: false, error: error.message };
    }

    // Resolve author profile
    let resolvedProfile: CommunityProfile = authorProfile || {
      id: userId,
      full_name: 'Eco Warrior',
      username: `eco_${userId.slice(0, 6)}`,
      role: 'Eco Warrior',
      avatar_url: null,
    };

    if (!authorProfile) {
      const { data: profData } = await supabase
        .from('profiles')
        .select('id, full_name, username, role, avatar_url')
        .eq('id', userId)
        .single();
      if (profData) {
        resolvedProfile = profData;
      }
    }

    const postItem: CommunityPostItem = {
      id: data.id,
      user_id: data.user_id,
      content: data.content,
      image_url: data.image_url,
      created_at: data.created_at,
      profiles: resolvedProfile,
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
      comments: [],
    };

    return { success: true, post: postItem };
  } catch (err: any) {
    console.error('Error creating post in Supabase:', err);
    return { success: false, error: err.message || 'Gagal menerbitkan postingan' };
  }
}

/**
 * Toggle Like on a post in public.likes directly with live Supabase insert or delete
 */
export async function togglePostLike(
  postId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<{ success: boolean; isLiked: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, isLiked: currentlyLiked, error: 'Database belum terhubung' };
  }

  const supabase = createClient();
  try {
    if (currentlyLiked) {
      // Live delete from public.likes
      const { error } = await supabase
        .from('likes')
        .delete()
        .match({ post_id: postId, user_id: userId });

      if (error) throw error;
      return { success: true, isLiked: false };
    } else {
      // Live insert into public.likes
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userId });

      if (error) throw error;
      return { success: true, isLiked: true };
    }
  } catch (err: any) {
    console.error('Error toggling like in Supabase:', err);
    return { success: false, isLiked: currentlyLiked, error: err.message };
  }
}

/**
 * Create a live Comment on a post in public.comments
 */
export async function createCommunityComment(params: {
  postId: string;
  userId: string;
  content: string;
  authorProfile?: CommunityProfile | null;
}): Promise<{ success: boolean; comment?: CommunityComment; error?: string }> {
  const { postId, userId, content, authorProfile } = params;

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Koneksi database belum terkonfigurasi.',
    };
  }

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content: content.trim(),
      })
      .select('id, post_id, user_id, content, created_at')
      .single();

    if (error) {
      console.error('Supabase insert comment error:', error.message);
      return { success: false, error: error.message };
    }

    let resolvedProfile: CommunityProfile = authorProfile || {
      id: userId,
      full_name: 'Eco Warrior',
      username: `eco_${userId.slice(0, 6)}`,
      role: 'Eco Warrior',
      avatar_url: null,
    };

    if (!authorProfile) {
      const { data: profData } = await supabase
        .from('profiles')
        .select('id, full_name, username, role, avatar_url')
        .eq('id', userId)
        .single();
      if (profData) {
        resolvedProfile = profData;
      }
    }

    const commentItem: CommunityComment = {
      id: data.id,
      post_id: data.post_id,
      user_id: data.user_id,
      content: data.content,
      created_at: data.created_at,
      profiles: resolvedProfile,
    };

    return { success: true, comment: commentItem };
  } catch (err: any) {
    console.error('Error creating comment in Supabase:', err);
    return { success: false, error: err.message || 'Gagal mengirim komentar' };
  }
}
