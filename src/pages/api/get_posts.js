import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://irnbxzypblrfgwwyiyhe.supabase.co"
const supabase = createClient(
    SUPABASE_URL, process.env.SUPABASE_KEY
);

const getPosts = async (req, res) => {
    console.log(`Fetching post from DB`)
    if (req.query.id) {
        let { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', req.query.id)
        res.status(200).json({ posts: posts });
    } else {
        let { data: posts, error } = await supabase
            .from('posts')
            .select('*')
        res.status(200).json({ posts: posts });
    }
};

export default getPosts;
