import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useState, useEffect } from 'react'
import Navbar from './navbar'
import renderPost from './render_post'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [tags, setTags] = useState([]);
    const [content, setContent] = useState("");
    const [creating, setCreating] = useState(false);
    const [titleTagsSet, setTitleTagsSet] = useState(false);
    const [recentlyEvaluated, setRecentlyEvaluated] = useState(false);
    const [embedding, setEmbedding] = useState([]);
    const [similarPosts, setSimilarPosts] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [blockPopup, setBlockPopup] = useState(false);
    const [currentTimeout, setCurrentTimeout] = useState(null);
    const [currentSearchId, setCurrentSearchId] = useState(0);
    const [latestSearch, setLatestSearch] = useState(0);
    const [diffCount, setDiffCount] = useState(10);

    const setWithDiff = (origValue, newValue, setfn) => {
        const diff = Math.abs(origValue.length - newValue.length)
        setfn(newValue);
        setDiffCount(diffCount + diff);
    }

    useEffect(() => {
        const isSet = (title != "") && (tags.length > 0);
        setTitleTagsSet(isSet);
        setSimilarPosts([]);
    }, [title, tags]);

    useEffect(() => {
        if (titleTagsSet) {
            evaluatePost()
        }
    }, [titleTagsSet]);

    useEffect(() => {
        if (!recentlyEvaluated && titleTagsSet && diffCount >= 10) {
            setDiffCount(0);
            evaluatePost();
        }
    }, [diffCount, recentlyEvaluated]);

    const callEvalEndpoint = async (post, searchId, depth) => {
        if (depth > 3) return;

        await fetch('/api/evaluate_post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ post: post, searchId: searchId }),
        }).then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw response;
        }).then(function (data) {
            const { embedding, similarPosts, searchId } = data;
            if (searchId > latestSearch){
                setLatestSearch(searchId);
                setEmbedding(embedding);
                setSimilarPosts(similarPosts);
                if (!blockPopup && similarPosts.length > 0) {
                    setShowPopup(true);
                }
            }
        }).catch(function (error) {
            console.warn("Error:",error);
            console.log("Failed, trying again...");
            callEvalEndpoint(post, searchId, depth+1);
        })
    }

    const evaluatePost = async () => {
        if (recentlyEvaluated) return;
        setRecentlyEvaluated(true);
        if (currentTimeout) clearTimeout(currentTimeout);
        setCurrentTimeout(setTimeout(() => setRecentlyEvaluated(false), 10000));

        console.log("Evaluating post....")
        const post = {
            title: title,
            author: author,
            tags: tags,
            content: content
        };

        setCurrentSearchId(currentSearchId+1);
        callEvalEndpoint(post, currentSearchId, 0);
    }

    const createPost = async () => {
        setCreating(true);

        const post = {
            title: title,
            author: author,
            tags: tags,
            content: content
        };

        await fetch('/api/create_post', {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                post: post,
                embedding: embedding
            }),
          }).then(function (response) {
              if (response.ok) {
                console.log("Post successfully created");
                setCreating(false);
                alert("Post succesfully created!");
                return;
              }
              throw response;
          }).catch(function (error) {
              console.warn("Error:",error)
              alert("Error: We had an issue creating your post. Please try again.")
          })
    }

    const renderForm = () => {
        return (
            <div className="w-60vw">
                <h1 className="mb-4">Create your post!</h1>
                <div className="d-flex flex-row mb-2">
                    <div className="w-25 align-self-center">
                        <h6 className="my-auto text-start">Your Title</h6>
                    </div>
                    <div className="container-fluid">
                        <input
                        type="text"
                        placeholder="Your awesome post title here"
                        value={title}
                        onChange={(event) => setWithDiff(title, event.target.value, setTitle) }
                        />
                    </div>
                </div>

                <div className="d-flex flex-row mb-2">
                    <div className="w-25 align-self-center">
                        <h6 className="my-auto text-start">Your Name / Alias</h6>
                    </div>
                    <div className="container-fluid">
                        <input
                        type="text"
                        placeholder="Who are you?"
                        value={author}
                        onChange={(event) => setAuthor(event.target.value)}
                        />
                    </div>
                </div>

                <div className="d-flex flex-row mb-2">
                    <div className="w-25 align-self-center">
                        <h6 className="my-auto text-start">Tags</h6>
                    </div>
                    <div className="container-fluid">
                        <select
                            multiple
                            onChange={(event) => {
                                const selectedTags = [...event.target.options]
                                    .filter(option => option.selected)
                                    .map(option => option.value)
                                setTags(selectedTags)
                                setDiffCount(diffCount + 5)
                            }}
                        >
                            <option>Fun</option>
                            <option>Lifestyle</option>
                            <option>Cooking</option>
                            <option>Pets</option>
                            <option>Minecraft</option>
                        </select>
                    </div>
                </div>

                <div className="d-flex flex-row mb-2">
                    <div className="w-25 align-self-center">
                        <h6 className="my-auto text-start">Your content</h6>
                    </div>
                    <div className="container-fluid">
                        <textarea
                            rows="3"
                            value={content}
                            placeholder="Please input your title and select a few tags first"
                            disabled={!titleTagsSet}
                            onChange={(event) => setContent(event.target.value)}
                        ></textarea>
                    </div>
                </div>

                <button
                    className="btn btn-outline-primary w-100 mt-3 mb-2"
                    onClick={createPost}
                    disabled={creating || embedding.length == 0}
                >Create your post</button>
            </div>
        )
    }

    const renderPopup = () => {
        return (
            <div className="card d-flex flex-col w-50 justify-content-center p-5" align="center">
                <h4 className="mb-3">Hey! We think a similar post may already exist. Would you like to check these out before writing yours?</h4>
                { similarPosts.map((post) => {
                    return renderPost(post)
                }) }
                <div className="flex-row d-flex justify-content-around">
                    <a className="btn btn-outline-primary" href="/posts">Thanks! Go to posts</a>
                    <a className="btn btn-outline-primary"
                        onClick={() => {
                            setShowPopup(false);
                            setBlockPopup(true);
                        }}
                    >Keep writing post</a>
                </div>
            </div>
        )
    }

    const renderSimilarPosts = () => {
        return (
          <div className="w-25">
            <br/><br/>
            <h5>Similar Posts</h5>
            {similarPosts.map((post) => renderPost(post))}
          </div>
        )
      }

  return (
    <>
      <Head>
        <title>Forum Posts</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Navbar />
        { !showPopup && 
            <div className="flex-col w-75" align="center">
            <div className="d-flex flex-row justify-content-center">
                { renderForm() }
                { similarPosts.length > 0 && renderSimilarPosts() }
            </div>
            </div>
        }
        { showPopup && renderPopup() }
      </main>
    </>
  )
}