const header = ReactDOM.createRoot(document.querySelector("#header"));
header.render(<Header header="All Post" />)

const root = ReactDOM.createRoot(document.querySelector("#main"));

root.render(<AllPost />)


// TODO: fetch post
// TODO: Render fetched post
function AllPost() {
    return (
        <div>
            <NewPost />
        </div>
    );
}


function Header(props) {
    return (
        <b>
            {props.header.toUpperCase()}
        </b>
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

        // Send email to server
        const responne = await fetch("/newpost", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
            body: JSON.stringify(post),
        });
        const data = await responne.json();
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
};