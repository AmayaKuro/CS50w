const root = ReactDOM.createRoot(document.querySelector("#container"));
root.render(<App />);


function App() {
    var currentPath = window.location.pathname.split("/");
    var header = currentPath[1];

    switch (header) {
        case "":
            return (
                <div>
                    <Header header="All Post" />
                    <div id="main">
                        <NewPost />
                        <Posts path="post" />
                    </div>
                </div>
            );

        case "profile":
            let user = currentPath[2];

            return (
                <div>
                    <Header header={header} />
                    <div id="main">
                        <UserHeader user={user} />
                        <Posts path="profile" user={user} />
                    </div>
                </div>
            );

        case "following":
            return (
                <div>
                    <Header header={header} />
                    <div id="main">
                        <Posts path="following" />
                    </div>
                </div>
            );

        default:
            break;
    }


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
            method: "POST",
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


function UserHeader(props) {
    const [userInfo, setInfo] = React.useState({});
    const [isOwner, setOwner] = React.useState(false);
    const [followState, setFollowState] = React.useState(false);
    const [disable, setDisable] = React.useState(false);

    React.useEffect(() => {
        const header = async () => {
            const responne = await fetch(`/api/userinfo/${props.user}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
                },
            })
            const data = await responne.json();
            setInfo(data.userInfo);
            setOwner(data.owner);
            setFollowState(data.isFollowing);
        }
        header();
    }, []);

    const follow = React.useCallback(async () => {
        const respone = await fetch(`/api/follow/${props.user}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
        })
        const data = await respone.json();
        setDisable(data === "error" ? true : false);
        setFollowState(followState => !followState);
    }, []);


    return (
        <div id="user-header">
            <b>{userInfo.username}</b>
            <span>Follower: {userInfo.follower}</span>
            <span>Following: {userInfo.following}</span>
            {(!isOwner && !disable) ? <div className={followState.toString()} id="follow-btn" onClick={follow}>{followState ? "Followed" : "Follow"}</div> : null}
        </div>
    );
}


// TODO: make this avaible for other's use
function Posts({ path, user }) {
    const [posts, morePosts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);
    const currentPostIndex = React.useRef(0);

    // Process props for fetching
    const fullPath = [path, user].filter(Boolean).join("/");

    // Request post from server
    const display = React.useCallback(async () => {
        // TODO: Update this buy-time mechanic (Current problem: loading always 
        // false even when currenPostIndex and hasMore had not been update)

        // Begin fetching request
        setLoading(true);
        const responne = await fetch(`/api/${fullPath}/${currentPostIndex.current}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
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
                <SinglePost post={post.post} pid={post.post.id} key={post.post.id} ownerShip={post.ownerShip} />
            ))}
        </div>
    );
}

function SinglePost(props) {
    const [editState, setEditState] = React.useState(false);
    const [currentContent, setCurrentContent] = React.useState(props.post.content);

    // NOTE: may pass edit func from parent props or pass props 
    // to child and create edit func in child

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
                <a href={`/profile/${props.post.owner}`}>
                    <span className="owner">{props.post.owner}</span>
                </a>
                <span className="time-stamp">{date} {props.pid}</span>
                {props.ownerShip ? <div onClick={() => setEditState(per => !per)}>click</div> : null}
            </span>
            {editState ? <EditPost id={props.post.id} content={currentContent} handleState={{setEditState: setEditState, setCurrentContent: setCurrentContent}} />
                : <DisplayPost post={props.post} currentContent={currentContent} />}
        </div>
    );
}

function DisplayPost(props) {
    return (
        <div>
            <div className="content">{props.currentContent}</div>
            <div className="likes">
                <i style={{ fontSize: "24px", color: "red", marginRight: "0.5rem" }}>&#9829;</i>
                {props.post.likes}
            </div>
        </div>
    )
}

function EditPost(props) {
    const [content, setContent] = React.useState(props.content);
    const editPost = React.useCallback(async () => {
        const responne = await fetch(`/api/editpost/${props.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
            body: JSON.stringify({ content: content }),
        });
        const data = await responne.json();
        props.handleState.setCurrentContent(data.post.content);
        props.handleState.setEditState(false);
    }, [content]);

    return (
        <div>
            <div className="content" onBlur={event => setContent(event.target.textContent)} contentEditable>{content}</div>
            <input className="edit-submit" type="submit" onClick={editPost}></input>
        </div>
    )
}


// TODO: turn this to general use fetch (change url to var)
function TestAPI() {
    const a = async function request() {
        const responne = await fetch("/api/editpost/59", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
            body: JSON.stringify({ content: "lmao" }),
        });
        const data = await responne.json();
        console.log(data);
    }
    return (
        <div onClick={a}>testAPI</div>
    );
}