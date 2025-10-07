function CreateNewPost() {
    return (
        <div>
            <h1>Create New Post</h1>
            <form>
                <div>
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" name="title" />
                </div>
                <div>
                    <label htmlFor="content">Content:</label>
                    <textarea id="content" name="content"></textarea>
                </div>
                <button type="submit">Publish</button>
            </form>
        </div>
    )
}

export default CreateNewPost
