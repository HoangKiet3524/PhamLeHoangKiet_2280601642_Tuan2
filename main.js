// ==================== POSTS FUNCTIONS ====================
async function GetData() {
    try {
        let res = await fetch('http://localhost:3000/posts')
        if (res.ok) {
            let posts = await res.json();
            let bodyTable = document.getElementById('body-table');
            bodyTable.innerHTML = '';
            for (const post of posts) {
                bodyTable.innerHTML += convertObjToHTML(post)
            }
        }
    } catch (error) {
        console.log(error);
    }
}

async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("views_txt").value;

    if (id) {
        // Update existing post
        let getItem = await fetch('http://localhost:3000/posts/' + id);
        if (getItem.ok) {
            let existingPost = await getItem.json();
            let res = await fetch('http://localhost:3000/posts/' + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    views: views,
                    isDeleted: existingPost.isDeleted || false
                })
            })
        }
    } else {
        // Create new post with auto-increment ID
        let maxId = await getMaxPostId();
        let newId = (maxId + 1).toString();
        
        let res = await fetch('http://localhost:3000/posts', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: newId,
                title: title,
                views: views,
                isDeleted: false
            })
        })
    }
    
    // Clear form
    document.getElementById("id_txt").value = '';
    document.getElementById("title_txt").value = '';
    document.getElementById("views_txt").value = '';
    
    GetData();
    return false;
}

async function getMaxPostId() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        if (res.ok) {
            let posts = await res.json();
            if (posts.length === 0) return 0;
            return Math.max(...posts.map(p => parseInt(p.id) || 0));
        }
    } catch (error) {
        console.log(error);
    }
    return 0;
}

function convertObjToHTML(post) {
    let style = post.isDeleted ? 'text-decoration: line-through; color: #999;' : '';
    let deleteBtn = post.isDeleted 
        ? `<input type='button' value='Restore' onclick='RestorePost("${post.id}")'>`
        : `<input type='button' value='Delete' onclick='Delete("${post.id}")'>`;
    
    return `<tr style="${style}">
    <td>${post.id}</td>
    <td>${post.title}</td>
    <td>${post.views}</td>
    <td>
        <input type='button' value='Edit' onclick='EditPost("${post.id}")'>
        ${deleteBtn}
    </td>
    </tr>`
}

async function Delete(id) {
    // Soft delete - set isDeleted to true
    let getItem = await fetch('http://localhost:3000/posts/' + id);
    if (getItem.ok) {
        let post = await getItem.json();
        let res = await fetch('http://localhost:3000/posts/' + id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                isDeleted: true
            })
        })
        if (res.ok) {
            GetData()
        }
    }
    return false;
}

async function RestorePost(id) {
    let res = await fetch('http://localhost:3000/posts/' + id, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            isDeleted: false
        })
    })
    if (res.ok) {
        GetData()
    }
    return false;
}

async function EditPost(id) {
    let res = await fetch('http://localhost:3000/posts/' + id);
    if (res.ok) {
        let post = await res.json();
        document.getElementById("id_txt").value = post.id;
        document.getElementById("title_txt").value = post.title;
        document.getElementById("views_txt").value = post.views;
    }
}

// ==================== COMMENTS FUNCTIONS ====================
async function GetComments() {
    try {
        let res = await fetch('http://localhost:3000/comments')
        if (res.ok) {
            let comments = await res.json();
            let bodyTable = document.getElementById('comments-table-body');
            bodyTable.innerHTML = '';
            for (const comment of comments) {
                bodyTable.innerHTML += convertCommentToHTML(comment)
            }
        }
    } catch (error) {
        console.log(error);
    }
}

async function SaveComment() {
    let id = document.getElementById("comment_id_txt").value;
    let text = document.getElementById("comment_text_txt").value;
    let postId = document.getElementById("comment_postId_txt").value;

    if (id) {
        // Update existing comment
        let getItem = await fetch('http://localhost:3000/comments/' + id);
        if (getItem.ok) {
            let existingComment = await getItem.json();
            let res = await fetch('http://localhost:3000/comments/' + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: text,
                    postId: postId,
                    isDeleted: existingComment.isDeleted || false
                })
            })
        }
    } else {
        // Create new comment with auto-increment ID
        let maxId = await getMaxCommentId();
        let newId = (maxId + 1).toString();
        
        let res = await fetch('http://localhost:3000/comments', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: newId,
                text: text,
                postId: postId,
                isDeleted: false
            })
        })
    }
    
    // Clear form
    document.getElementById("comment_id_txt").value = '';
    document.getElementById("comment_text_txt").value = '';
    document.getElementById("comment_postId_txt").value = '';
    
    GetComments();
    return false;
}

async function getMaxCommentId() {
    try {
        let res = await fetch('http://localhost:3000/comments');
        if (res.ok) {
            let comments = await res.json();
            if (comments.length === 0) return 0;
            return Math.max(...comments.map(c => parseInt(c.id) || 0));
        }
    } catch (error) {
        console.log(error);
    }
    return 0;
}

function convertCommentToHTML(comment) {
    let style = comment.isDeleted ? 'text-decoration: line-through; color: #999;' : '';
    let deleteBtn = comment.isDeleted 
        ? `<input type='button' value='Restore' onclick='RestoreComment("${comment.id}")'>`
        : `<input type='button' value='Delete' onclick='DeleteComment("${comment.id}")'>`;
    
    return `<tr style="${style}">
    <td>${comment.id}</td>
    <td>${comment.text}</td>
    <td>${comment.postId}</td>
    <td>
        <input type='button' value='Edit' onclick='EditComment("${comment.id}")'>
        ${deleteBtn}
    </td>
    </tr>`
}

async function DeleteComment(id) {
    // Soft delete - set isDeleted to true
    let getItem = await fetch('http://localhost:3000/comments/' + id);
    if (getItem.ok) {
        let comment = await getItem.json();
        let res = await fetch('http://localhost:3000/comments/' + id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                isDeleted: true
            })
        })
        if (res.ok) {
            GetComments()
        }
    }
    return false;
}

async function RestoreComment(id) {
    let res = await fetch('http://localhost:3000/comments/' + id, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            isDeleted: false
        })
    })
    if (res.ok) {
        GetComments()
    }
    return false;
}

async function EditComment(id) {
    let res = await fetch('http://localhost:3000/comments/' + id);
    if (res.ok) {
        let comment = await res.json();
        document.getElementById("comment_id_txt").value = comment.id;
        document.getElementById("comment_text_txt").value = comment.text;
        document.getElementById("comment_postId_txt").value = comment.postId;
    }
}

// Initialize data on page load
GetData();
GetComments();
