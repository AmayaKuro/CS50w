const root = ReactDOM.createRoot(document.querySelector("#container"));
root.render(<AllPost />);


function AllPost() {
    return (
        <div>
            <Header header="All Post" />
            <div id="main">
                <NewPost />
                <Posts />
            </div>
        </div>
    );
}


function Header(props) {
    return (
        <div id="header">
            <b>
                {props.header.toUpperCase()}
            </b>
            <div style={{ marginRight: "auto" }}>
                <TestAPI />
            </div>
        </div>
    );
};


function NewPost() {
    async function handleNewPost(e) {
        // Stop form from submitting
        e.preventDefault();

        // Get data of email send
        const post = {
            "content": e.target.elements.post.value,
        };

        // Send post to server
        const responne = await fetch("/api/newpost", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
            body: JSON.stringify(post),
        });
        const data = await responne.json();

        data.timeStamp = new Date(data.timeStamp * 1000);
    }

    return (
        <div className="post-item" id="new-post-holder">
            <p>New Post</p>
            <form id="new-post" onSubmit={handleNewPost}>
                <textarea autoComplete="off" id="new-post-content" name="post" placeholder="Create new post"></textarea>
                <input type="submit"></input>
            </form>
        </div>
    );
}

// TODO: make this avaible for other's use
function Posts() {
    const [posts, morePosts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);
    const currentPostIndex = React.useRef(0);


    const debug = React.useCallback(() => {
        console.log("Call back || Loading: ", loading);
    }, [loading]);

    // Request post from server
    const display = React.useCallback(async () => {
        // TODO: Update this buy-time mechanic (Current problem: loading always 
        // false even when currenPostIndex and hasMore had not been update)

        // Begin fetching request
        setLoading(true);
        const responne = await fetch("/api/post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
            body: JSON.stringify({ postIndex: currentPostIndex.current }),
        });

        const data = await responne.json();

        morePosts(pevPosts => [...pevPosts, ...data.posts]);
        currentPostIndex.current += 10;
        setHasMore(!data.outOfPosts);
        setLoading(false);

    }, [currentPostIndex]);


    React.useEffect(() => {
        display();
    }, []);

    React.useEffect(() => {
        const onScroll = () => {
            if (loading || !hasMore) {
                return;
            }

            // If user scroll to the end of page, fetch more posts
            if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 200) {
                display();
            }
        }
        // clean up code
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, [loading, hasMore, display]);


    return (
        // TODO: keep render new element but not re-render causing page resetting? 
        <div>
            {posts.map((post) => (
                <SinglePost post={post} pid={post.id} key={post.id} />
            ))}
        </div>
    );
}


function SinglePost(props) {
    // TODO: manange like button (later)
    // const [likeState, changeLikeStage] = React.useState(props.post.likes);

    // async function like() {
    //     let respone = await fetch("/like", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //             "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
    //         },
    //     })
    //     let data = respone.json();
    //     console.log(respone);
    // }

    var options = {
        hour12: true,
        hour: "numeric",
        minute: "numeric",
        day: "numeric",
        month: "short",
        year: "numeric",
    }

    let date = new Date(props.post.timeStamp * 1000);
    date = date.toLocaleDateString("en-US", options);

    return (
        <div className="post-item">
            <span className="title">
                <Link to={`/profile/${props.post.owner}`}>
                    <span className="owner">{props.post.owner}</span>
                </Link>
                <span className="time-stamp">{date} {props.pid}</span>
            </span>
            <div className="content">{props.post.content}</div>
            <div className="likes">
                <i style={{ fontSize: "24px", color: "red", marginRight: "0.5rem" }}>&#9829;</i>
                {props.post.likes}
            </div>
            <div className="comment"></div>
        </div>
    );
}


function TestAPI() {
    const [posts, morePosts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);
    const currentPostIndex = React.useRef(1);

    async function test() {
        const responne = await fetch("/api/profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
            body: JSON.stringify({ postIndex: currentPostIndex.current }),
        });
        const data = await responne.json();
        console.log(data);
    }
    return (
        <div onClick={test}>testAPI</div>
    )
}