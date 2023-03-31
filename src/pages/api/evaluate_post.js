import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

const SUPABASE_URL = "https://irnbxzypblrfgwwyiyhe.supabase.co"
const supabase = createClient(
    SUPABASE_URL, process.env.SUPABASE_KEY
);

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const distance = (eb1, eb2) => {
    return eb1.map((_, idx) => eb1[idx] * eb2[idx]).reduce((v1,v2) => v1+v2);
}

const evaluatePost = async (req, res) => {
    const post = req.body.post
    const searchId = req.body.searchId

    // Generate embedding
    const response = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: post.title
    });
    const embedding = response.data.data.pop().embedding;
    console.log(`Returning embedding for string ${post.title} from embeddings API`);

    // Get embedding data
    let { data: embeddings, error } = await supabase
        .from('embeddings')
        .select('*')
        .contains('tags', post.tags)
    console.log(`Fetching all embeddings that match tags`)

    const sortableEmbeddings = embeddings.map((ebData) => {
        const dist = distance(embedding, ebData.embedding)
        return {
            distance: dist,
            ebData: ebData
        }
    })

    // Calculate distances and sort
    console.log("Evaluating closest posts")
    sortableEmbeddings.sort(function(eb1, eb2) {
        if (eb1.distance < eb2.distance) return 1;
        else if (eb1.distance > eb2.distance) return -1;
        else return 0;
    })
    
    const similarPosts = []
    sortableEmbeddings.forEach((item) => {
        if (item.distance > 0.85 && similarPosts.length < 3) {
            similarPosts.push(item.ebData.post_id);
        }
    })

    // Fetch similar post data
    let { data: posts, error3 } = await supabase
        .from('posts')
        .select('*')
        .in('id', similarPosts)
    console.log(`Fetching similar posts`)

    res.status(200).json({
        embedding: embedding,
        similarPosts: posts,
        searchId: searchId
    });
};

export default evaluatePost;
