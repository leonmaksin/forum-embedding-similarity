import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://irnbxzypblrfgwwyiyhe.supabase.co"
const supabase = createClient(
    SUPABASE_URL, process.env.SUPABASE_KEY
);

const createPost = async (req, res) => {
    const post = req.body.post

    const { data, error } = await supabase
        .from('posts')
        .insert([post])
        .select()
    const id = data[0].id

    const embedding = req.body.embedding

    const { data2, error2 } = await supabase
        .from('embeddings')
        .insert([
            {
                embedding: embedding,
                tags: post.tags,
                post_id: id
            },
        ])

    res.status(200).json({});
};

export default createPost;
