import Link from 'next/link'

const Navbar = () => {
    return (<div className="d-flex flex-row nav-row mb-3 align-self-end">
        <Link href="/posts" className="mx-4">Posts</Link>
        <Link href="create-post" className="mx-4">Create Post</Link>
    </div>)
}

export default Navbar;