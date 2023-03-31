import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useState, useEffect } from 'react'
import Navbar from './navbar'
import renderPost from './render_post'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [posts, setPosts] = useState([]);

  const callGetSetPosts = async () => {
    await fetch('/api/get_posts', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      }
    }).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        throw response;
    }).then(function (data) {
        const { posts } = data;
        setPosts(posts);
    }).catch(function (error) {
        console.warn("Error:",error)
        setPosts([]);
    })
  }

  useEffect(() => {
    callGetSetPosts()
  }, []);

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
        <div className="flex-col" align="center">
          <h1 className="mb-4">Welcome to our forum! Here are some of our top posts</h1>
          <a className="btn btn-outline-primary mb-4" href="/create-post">Create your own post :)</a>
          { posts.map((post) => renderPost(post)) }
        </div>
      </main>
    </>
  )
}