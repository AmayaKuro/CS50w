const root = ReactDOM.createRoot(document.querySelector("#main"));

root.render(<Test/>)
function Test() {
    const [demo, edit] = React.useState(0);
    return (
        <div>{demo}</div>
    );
}