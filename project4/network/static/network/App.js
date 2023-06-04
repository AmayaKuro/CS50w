const header = ReactDOM.createRoot(document.querySelector("#header"));
header.render(<Header header="All Post" />)

const root = ReactDOM.createRoot(document.querySelector("#main"));

root.render(<AllPost />)


// TODO: fetch post
// TODO: Render fetched post
function AllPost() {
    return (
        <div>
            {/* <Header header="All Post" /> */}
            <NewPost />
            <Posts />
        </div>
    );
}


function Header(props) {
    return (
        <div id="header">
            <b>
                {props.header.toUpperCase()}
            </b>
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
        const responne = await fetch("/newpost", {
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
                <textarea autoComplete="off" id="new-content" name="post" placeholder="Create new post"></textarea>
                <input type="submit"></input>
            </form>
        </div>
    );
}


function Posts() {
    const [posts, morePosts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);
    const currentPostIndex = React.useRef(1);


    // Request post from server
    const display = React.useCallback(async () => {

        // TODO: Update this buy-time mechanic
        // Begin fetching request
        if (hasMore) {
            setLoading(true);
            const responne = await fetch("/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
                },
                body: JSON.stringify({ postIndex: currentPostIndex.current }),
            });
            const data = await responne.json();

            morePosts(pevPosts => [...pevPosts, ...data.posts]);

            if (data.outOfPosts) {
                setHasMore(false);
            }

            currentPostIndex.current = currentPostIndex.current + 10;

            // End fetching request
            setLoading(false);
        }

    }, [currentPostIndex, hasMore]);

    React.useEffect(() => {
        const onScroll = () => {
            if (loading || !hasMore) {
                return;
            }

            // If user scroll to the end of page, fetch more posts
            if (window.innerHeight + window.pageYOffset >= document.body.scrollHeight - 200) {
                display();
            }
        }

        // clean up code
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, [loading, hasMore]);

    React.useEffect(() => {
        display();
    }, []);

    return (
        // TODO: keep render new element but not re-render causing page resetting? 
        <div>
            {posts.map((post) => (
                <SinglePost post={post} key={post.id} />
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
                <span className="owner">{props.post.owner}</span>
                <span className="time-stamp">{date}</span>
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