import { createClient, isSupabaseConfigured, CommunityPostItem, CommunityComment, CommunityProfile } from '@/src/lib/supabase';

const INITIAL_FALLBACK_POSTS: CommunityPostItem[] = [
  {
    id: 'b7c84e12-4211-4f1a-b620-80a96f1201aa',
    user_id: 'user_salsabila_01',
    content: 'Tadi sore selesai nyulap 12 botol minyak goreng HDPE bekas jadi set pot gantung estetik buat koridor kampus! 🪴✨\n\nRahasianya: dipotong pakai cutter hangat terus dihaluskan tepinya pakai amplas 400 grit. Nggak nyangka sampah plastik keras bisa kelihatan kayak keramik Nordic! Ada yang mau tutorial step-by-step di tab DIY?',
    image_url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    likes_count: 24,
    comments_count: 3,
    is_liked: false,
    profiles: {
      id: 'user_salsabila_01',
      full_name: 'Salsabila Putri',
      username: 'salsabila_craft',
      role: 'Upcycle Artisan',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    comments: [
      {
        id: 'c1-1',
        post_id: 'b7c84e12-4211-4f1a-b620-80a96f1201aa',
        user_id: 'user_dimas_02',
        content: 'Keren banget kak Salsa! Bawahnya dilubangi pakai solder ya buat drainase airnya?',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        profiles: {
          id: 'user_dimas_02',
          full_name: 'Dimas Wicaksono',
          username: 'dimas_maker',
          role: 'Eco Warrior',
          avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
        },
      },
      {
        id: 'c1-2',
        post_id: 'b7c84e12-4211-4f1a-b620-80a96f1201aa',
        user_id: 'user_salsabila_01',
        content: '@dimas_maker Betul banget! 4 lubang kecil biar akar tanamannya nggak busuk 👍',
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        profiles: {
          id: 'user_salsabila_01',
          full_name: 'Salsabila Putri',
          username: 'salsabila_craft',
          role: 'Upcycle Artisan',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        },
      },
    ],
  },
  {
    id: 'c8d95f23-5322-5f2b-c731-91ba7f2302bb',
    user_id: 'user_bima_03',
    content: 'Update aksi pilah sampah hari ini: berhasil kumpul 18 kg kardus bekas paket kosan ke Bank Sampah Unit 4. 📦♻️\n\nDapet 250 Daun Points langsung ditabung buat unlock bibit pohon mangrove pesisir. Jangan buang kardus sembarangan ya kawan-kawan, kalau bersih nilainya tinggi!',
    image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    likes_count: 42,
    comments_count: 1,
    is_liked: false,
    profiles: {
      id: 'user_bima_03',
      full_name: 'Bima Pratama',
      username: 'bima_zerowaste',
      role: 'Pilah Hero',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    comments: [
      {
        id: 'c2-1',
        post_id: 'c8d95f23-5322-5f2b-c731-91ba7f2302bb',
        user_id: 'user_nadia_04',
        content: 'Mantap bang Bima! Lakban plastiknya dilepas dulu kan sebelum disetor?',
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        profiles: {
          id: 'user_nadia_04',
          full_name: 'Nadia Aurelia',
          username: 'nadia_recloth',
          role: 'Eco Warrior',
          avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        },
      },
    ],
  },
  {
    id: 'd9e06a34-6433-6a3c-d842-02cb8a3403cc',
    user_id: 'user_nadia_04',
    content: 'Eksperimen pertama upcycling jeans denim bekas sobek jadi tote bag laptop tahan air! 🎒👖\n\nBagian dalamnya saya lapisi plastik kresek tebal yang di-press pakai setrika (metode plastic fusing). Hasilnya kokoh, water-repellent, dan zero cost. Sampah tekstil dan kresek langsung berkurang!',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    likes_count: 57,
    comments_count: 0,
    is_liked: false,
    profiles: {
      id: 'user_nadia_04',
      full_name: 'Nadia Aurelia',
      username: 'nadia_recloth',
      role: 'Upcycle Artisan',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    },
    comments: [],
  },
];

const LOCAL_STORAGE_POSTS_KEY = 'bumikita_threads_community_posts';
const LOCAL_STORAGE_LIKES_KEY = 'bumikita_threads_community_user_likes';

function getLocalPosts(): CommunityPostItem[] {
  if (typeof window === 'undefined') return INITIAL_FALLBACK_POSTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(INITIAL_FALLBACK_POSTS));
      return INITIAL_FALLBACK_POSTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_FALLBACK_POSTS;
  }
}

function saveLocalPosts(posts: CommunityPostItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error('Error saving local community posts:', err);
  }
}

function getLocalUserLikes(userId: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_LIKES_KEY}_${userId}`);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveLocalUserLikes(userId: string, likedPostIds: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_LIKES_KEY}_${userId}`,
      JSON.stringify(Array.from(likedPostIds))
    );
  } catch (err) {
    console.error('Error saving local user likes:', err);
  }
}

/**
 * Fetch public posts with profiles, likes count, comments count, and current user like status
 */
export async function fetchCommunityPosts(currentUserId?: string | null): Promise<CommunityPostItem[]> {
  if (!isSupabaseConfigured()) {
    const posts = getLocalPosts();
    const userLikes = currentUserId ? getLocalUserLikes(currentUserId) : new Set<string>();
    return posts.map((p) => ({
      ...p,
      is_liked: userLikes.has(p.id),
      comments_count: p.comments?.length ?? p.comments_count ?? 0,
    }));
  }

  const supabase = createClient();
  try {
    // 1. Fetch posts with author profiles
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
      console.warn('Supabase fetch posts error, falling back to local dataset:', postsError.message);
      const posts = getLocalPosts();
      const userLikes = currentUserId ? getLocalUserLikes(currentUserId) : new Set<string>();
      return posts.map((p) => ({
        ...p,
        is_liked: userLikes.has(p.id),
        comments_count: p.comments?.length ?? p.comments_count ?? 0,
      }));
    }

    if (!postsData || postsData.length === 0) {
      return [];
    }

    const postIds = postsData.map((p) => p.id);

    // 2. Fetch all likes counts for these posts
    const { data: likesData } = await supabase
      .from('likes')
      .select('post_id, user_id')
      .in('post_id', postIds);

    // 3. Fetch all comments for these posts with profiles
    const { data: commentsData } = await supabase
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

    // Build likes lookup & user liked set
    const likesCountMap: Record<string, number> = {};
    const userLikedSet = new Set<string>();

    (likesData || []).forEach((like) => {
      likesCountMap[like.post_id] = (likesCountMap[like.post_id] || 0) + 1;
      if (currentUserId && like.user_id === currentUserId) {
        userLikedSet.add(like.post_id);
      }
    });

    // Group comments by post_id
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
    console.warn('Network / DB exception fetching community posts:', err);
    const posts = getLocalPosts();
    const userLikes = currentUserId ? getLocalUserLikes(currentUserId) : new Set<string>();
    return posts.map((p) => ({
      ...p,
      is_liked: userLikes.has(p.id),
      comments_count: p.comments?.length ?? p.comments_count ?? 0,
    }));
  }
}

/**
 * Create a new Post (Authenticated Only)
 */
export async function createCommunityPost(params: {
  userId: string;
  content: string;
  imageUrl?: string | null;
  authorProfile?: CommunityProfile | null;
}): Promise<{ success: boolean; post?: CommunityPostItem; error?: string }> {
  const { userId, content, imageUrl, authorProfile } = params;

  if (!isSupabaseConfigured()) {
    const newPost: CommunityPostItem = {
      id: 'local_post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: userId,
      content: content.trim(),
      image_url: imageUrl?.trim() || null,
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
      profiles: authorProfile || {
        id: userId,
        full_name: 'Eco Warrior',
        username: 'eco_user',
        role: 'Eco Warrior',
        avatar_url: null,
      },
      comments: [],
    };

    const current = getLocalPosts();
    saveLocalPosts([newPost, ...current]);
    return { success: true, post: newPost };
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
      console.warn('Supabase insert post failed:', error.message);
      // Fallback locally
      return createCommunityPost({ ...params, imageUrl: imageUrl || null });
    }

    const postItem: CommunityPostItem = {
      id: data.id,
      user_id: data.user_id,
      content: data.content,
      image_url: data.image_url,
      created_at: data.created_at,
      profiles: (data as any).profiles || authorProfile,
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
      comments: [],
    };

    return { success: true, post: postItem };
  } catch (err: any) {
    console.error('Error creating post:', err);
    return { success: false, error: err.message || 'Gagal menerbitkan postingan' };
  }
}

/**
 * Toggle Like on a post (Authenticated Only)
 */
export async function togglePostLike(
  postId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<{ success: boolean; isLiked: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const likes = getLocalUserLikes(userId);
    let newStatus = false;
    if (currentlyLiked) {
      likes.delete(postId);
      newStatus = false;
    } else {
      likes.add(postId);
      newStatus = true;
    }
    saveLocalUserLikes(userId, likes);

    // Update local post count
    const posts = getLocalPosts();
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          likes_count: Math.max(0, p.likes_count + (newStatus ? 1 : -1)),
          is_liked: newStatus,
        };
      }
      return p;
    });
    saveLocalPosts(updated);
    return { success: true, isLiked: newStatus };
  }

  const supabase = createClient();
  try {
    if (currentlyLiked) {
      // Unlike (delete from likes)
      const { error } = await supabase
        .from('likes')
        .delete()
        .match({ post_id: postId, user_id: userId });

      if (error) throw error;
      return { success: true, isLiked: false };
    } else {
      // Like (insert into likes)
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userId });

      if (error) throw error;
      return { success: true, isLiked: true };
    }
  } catch (err: any) {
    console.error('Error toggling like:', err);
    return { success: false, isLiked: currentlyLiked, error: err.message };
  }
}

/**
 * Create a new Comment on a post (Authenticated Only)
 */
export async function createCommunityComment(params: {
  postId: string;
  userId: string;
  content: string;
  authorProfile?: CommunityProfile | null;
}): Promise<{ success: boolean; comment?: CommunityComment; error?: string }> {
  const { postId, userId, content, authorProfile } = params;

  if (!isSupabaseConfigured()) {
    const newComment: CommunityComment = {
      id: 'local_comment_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      post_id: postId,
      user_id: userId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      profiles: authorProfile || {
        id: userId,
        full_name: 'Eco Warrior',
        username: 'eco_user',
        role: 'Eco Warrior',
        avatar_url: null,
      },
    };

    const posts = getLocalPosts();
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const comments = p.comments || [];
        return {
          ...p,
          comments: [...comments, newComment],
          comments_count: comments.length + 1,
        };
      }
      return p;
    });
    saveLocalPosts(updated);
    return { success: true, comment: newComment };
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
      console.warn('Supabase insert comment error:', error.message);
      return { success: false, error: error.message };
    }

    const commentItem: CommunityComment = {
      id: data.id,
      post_id: data.post_id,
      user_id: data.user_id,
      content: data.content,
      created_at: data.created_at,
      profiles: (data as any).profiles || authorProfile,
    };

    return { success: true, comment: commentItem };
  } catch (err: any) {
    console.error('Error creating comment:', err);
    return { success: false, error: err.message || 'Gagal mengirim komentar' };
  }
}
