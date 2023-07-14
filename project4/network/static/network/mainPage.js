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
                        <Posts path="post/profile" user={user} />
                    </div>
                </div>
            );

        case "following":
            return (
                <div>
                    <Header header={header} />
                    <div id="main">
                        <Posts path="post/following" />
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
        // Get data of email send
        const post = {
            "content": e.target.elements.post.value,
        };

        // Send post to server
        const respone = await fetch("/api/newpost", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
            body: JSON.stringify(post),
        });
        if (!respone.ok) {
            alert("User must log in to do that!");
        }
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
            const respone = await fetch(`/api/userinfo/${props.user}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
                },
            })
            const data = await respone.json();
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
        if (!respone.ok) {
            alert("User must log in to do that!");
        }
        else {
            const data = await respone.json();
            setDisable(data === "error" ? true : false);
            setFollowState(followState => !followState);
        }
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


function Posts({ path, user }) {
    const [posts, morePosts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);
    const currentPostIndex = React.useRef(0);

    // Process props for fetching
    const fullPath = [path, user].filter(Boolean).join("/");

    // Request post from server
    async function display() {
        // TODO: Update this buy-time mechanic (Current problem: loading always 
        // false even when currenPostIndex and hasMore had not been update)
        // Begin fetching request
        setLoading(true);
        fetch(`/api/${fullPath}/${currentPostIndex.current}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
        }).then(res => {
            return !res.ok 
            ? res.json().then(e => Promise.reject(e))
            : res.json();
        }).then(data => {
            morePosts(pevPosts => [...pevPosts, ...data.posts]);
            currentPostIndex.current += 10;
            setHasMore(!data.outOfPosts);
            setLoading(false);
        }).catch(err => {
            alert(err);
            window.location.href = "/";
        });
    }
    
    React.useEffect(() => {
        display();
    }, []);

    // TODO: turn this back to set timeout
    // Handle scroll event
    const onScroll = () => {
        if (loading || !hasMore) return;

        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 50) {
            display();
        }
    };

    React.useEffect(() => {
        // clean up code
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, [loading, hasMore]);


    return (
        // TODO: keep render new element but not re-render causing page resetting? 
        <div>
            {posts.map((post) => (
                <SinglePost post={post} pid={post.id} key={Math.random()*200000 +post.id} />
            ))}
        </div>
    );
}

function SinglePost(props) {
    const [editState, setEditState] = React.useState(false);
    const [currentContent, setCurrentContent] = React.useState(props.post.content);

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
                {props.post.ownerShip ?
                    <div className={`edit-btn ${editState ? "editing" : ""}`} onClick={() => setEditState(per => !per)}>
                        <span>&#9998;</span>
                    </div>
                    : null
                }
            </span>
            {editState ? <EditPost id={props.post.id} content={currentContent} handleState={{ setEditState: setEditState, setCurrentContent: setCurrentContent }} />
                : <DisplayPost post={props.post} currentContent={currentContent} />}
        </div>
    );
}

function DisplayPost(props) {
    // TODO: manange like button (later)
    const [likeState, setLikeStage] = React.useState(props.post.liked);
    const [likes, setLikes] = React.useState(props.post.likes);

    const like = React.useCallback(async () => {
        const respone = await fetch(`/api/like/${props.post.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
        })
        if (!respone.ok) {
            alert("You must login to like post");
        }
        else {
            // TODO: fix this likeState not update (infinitive loop at likeState)
            setLikeStage(per => !per);
            setLikes(per => per + (likeState ? -1 : 1));
        }
    }, [likeState]);

    return (
        <div>
            <div className="content">{props.currentContent}</div>
            <span className="likes" onClick={like}>
                <i style={{ fontSize: "24px", color: `${likeState ? "red" : "white"}`, marginRight: "0.5rem" }}>&#9829;</i>
                {likes}
            </span>
        </div>
    )
}

function EditPost(props) {
    const content = React.useRef(null);
    const editPost = React.useCallback(async () => {
        const respone = await fetch(`/api/editpost/${props.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
            body: JSON.stringify({ content: content.current.textContent }),
        });
        const data = await respone.json();
        props.handleState.setCurrentContent(data.post.content);
        props.handleState.setEditState(false);
    }, [content]);

    // Place cursor at the end of content when open edit mode || may change to useref
    React.useEffect(() => {
        var el = content.current;
        var range = document.createRange();
        var sel = window.getSelection();

        range.setStart(el.childNodes[0], el.childNodes[0].length);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);

        el.focus();
    }, [content]);


    return (
        <div>
            <div className="content"
                ref={content}
                suppressContentEditableWarning={true}
                contentEditable
                autoFocus={true}
            >
                {props.content}
            </div>
            <input className="edit-submit" type="submit" onClick={editPost}></input>
        </div>
    )
}


// TODO: turn this to general use fetch (change url to var)
function TestAPI() {
    const a = async function request() {
        const respone = await fetch("/api/editpost/59", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
            body: JSON.stringify({ content: "lmao" }),
        });
        const data = await respone.json();
        console.log(data);
    }
    return (
        <div onClick={a}>testAPI</div>
    );
}