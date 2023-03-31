const renderPost = (post) => {
    return (<div key={post.id}>
      <div className="card w-75 mb-3">
        <div className="card-body">
          <h4 className="card-title">{post.title}</h4>
          <h5 className="card-subtitle mb-2 text-muted">{post.author == "" ? "Anon" : "By " + post.author}</h5>
          <h6 className="card-subtitle mb-2 text-muted">Tags: {post.tags.map((tag, idx) => <span>{idx ? ", " : ""}{tag}</span>)}</h6>
          <p className="card-text mb-0">{post.content}</p>
          <a href={ "/post?id=" + post.id } class="stretched-link"></a>
        </div>
      </div>
    </div>)
  }

export default renderPost;