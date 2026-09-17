import { createClient, isSupabaseConfigured, CommunityPostItem, CommunityComment, CommunityProfile } from '@/src/lib/supabase';

/**
 * Fetch live public posts directly from Supabase with relational profiles,
 * exact likes count, comments count, and the current user's like status.
 * Strictly 0 mock/dummy data. If the database is empty, returns an empty array.
 */
export async function fetchCommunityPosts(currentUserId?: string | null): Promise<CommunityPostItem[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured. Community relies 100% on live Supabase data.');
    return [];
  }

  const supabase = createClient();
  try {
    // 1. Fetch live posts with author profiles, strictly ordered by created_at descending
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        content,
        image_url,
        created_at,
        profiles (
          id,
          full_name,
          username,
          role,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Supabase fetch posts error:', postsError.message);
      return [];
    }

    if (!postsData || postsData.length === 0) {
      return [];
    }

    const postIds = postsData.map((p) => p.id);

    // 2. Fetch live likes for exact counter and current user like status
    const { data: likesData, error: likesError } = await supabase
      .from('likes')
      .select('post_id, user_id')
      .in('post_id', postIds);

    if (likesError) {
      console.warn('Supabase fetch likes error:', likesError.message);
    }

    // 3. Fetch live comments for these posts with relational profiles
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        profiles (
          id,
          full_name,
          username,
          role,
          avatar_url
        )
      `)
      .in('post_id', postIds)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.warn('Supabase fetch comments error:', commentsError.message);
    }

    // Exact Likes map & user-liked set
    const likesCountMap: Record<string, number> = {};
    const userLikedSet = new Set<string>();

    (likesData || []).forEach((like) => {
      likesCountMap[like.post_id] = (likesCountMap[like.post_id] || 0) + 1;
      if (currentUserId && like.user_id === currentUserId) {
        userLikedSet.add(like.post_id);
      }
    });

    // Group live comments by post_id
    const commentsMap: Record<string, CommunityComment[]> = {};
    (commentsData || []).forEach((comment: any) => {
      if (!commentsMap[comment.post_id]) {
        commentsMap[comment.post_id] = [];
      }
      commentsMap[comment.post_id].push({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        profiles: comment.profiles || null,
      });
    });

    return postsData.map((post: any) => {
      const postComments = commentsMap[post.id] || [];
      return {
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        image_url: post.image_url,
        created_at: post.created_at,
        profiles: post.profiles || null,
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
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        profiles (
          id,
          full_name,
          username,
          role,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching live post comments:', error.message);
      return [];
    }

    return (data || []).map((c: any) => ({
      id: c.id,
      post_id: c.post_id,
      user_id: c.user_id,
      content: c.content,
      created_at: c.created_at,
      profiles: c.profiles || null,
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
      .select(`
        id,
        user_id,
        content,
        image_url,
        created_at,
        profiles (
          id,
          full_name,
          username,
          role,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Supabase insert post failed:', error.message);
      return { success: false, error: error.message };
    }

    const postItem: CommunityPostItem = {
      id: data.id,
      user_id: data.user_id,
      content: data.content,
      image_url: data.image_url,
      created_at: data.created_at,
      profiles: (data as any).profiles || authorProfile || null,
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
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        profiles (
          id,
          full_name,
          username,
          role,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Supabase insert comment error:', error.message);
      return { success: false, error: error.message };
    }

    const commentItem: CommunityComment = {
      id: data.id,
      post_id: data.post_id,
      user_id: data.user_id,
      content: data.content,
      created_at: data.created_at,
      profiles: (data as any).profiles || authorProfile || null,
    };

    return { success: true, comment: commentItem };
  } catch (err: any) {
    console.error('Error creating comment in Supabase:', err);
    return { success: false, error: err.message || 'Gagal mengirim komentar' };
  }
}
