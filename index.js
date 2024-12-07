document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.querySelector("#second button");
    const subjectInput = document.querySelector("#subject");
    const questionTextarea = document.querySelector("#descryption");
    const secondBlock = document.getElementById("second");
    const thirdBlock = document.getElementById("third");
    const question_form = document.querySelector("#first button");

    const questionArea = document.querySelector("#questions");
    const questionDetail = document.getElementById("question_detail");
    const response = document.getElementById("submit_reponse");
    const comm = document.getElementById("comments");
    const searchBar = document.getElementById("searchBar");

    const favourite = document.getElementById("favourite");
    const remove = document.getElementById("remove");

    let arr = JSON.parse(localStorage.getItem("questions")) || [];
    let current_reference = null;
    let current_index = null;
    let disable = 0;
    let showFavourite = true;

    arr.forEach((item) => {
        if (item.flag == 1) {
            disable += 1;
        }
    })

    if (disable === 0) {
        favourite.setAttribute("disabled", "true");
    }

    if (!Array.isArray(arr)) {
        arr = [];
    }

    setInterval(() => {
        UpdateTime();
    }, 1000)

    function UpdateTime() {
        arr.forEach((question) => {
            question.time += 1;
    
            const questionElement = document.querySelector(`.question[index="${question.id}"]`);
            const timeElement = questionElement.querySelector(".time");
    
            if (question.time <= 60) {
                timeElement.textContent = `${question.time} sec ago`;
            } else if (question.time <= 3600) {
                timeElement.textContent = `${Math.floor(question.time / 60)} min ago`;
            } else {
                timeElement.textContent = `${Math.floor(question.time / 3600)} hour(s) ago`;
            }
        });
    
        localStorage.setItem("questions", JSON.stringify(arr));
    }
    
    submitButton.addEventListener("click", (event) => {
        event.preventDefault();

        const subject = subjectInput.value.trim();
        const question = questionTextarea.value.trim();

        if (!subject || !question) {
            alert("Fill both the fields properly.");
            subjectInput.value = "";
            questionTextarea.value = "";
            return;
        }

        const id = Date.now();
        let flag = 0;
        let time = 0;

        const newQuestion = { id, subject, question, answer: {}, flag, time };
        arr.push(newQuestion);
        localStorage.setItem("questions", JSON.stringify(arr));
        const questionDiv = document.createElement("div");
        questionDiv.className = "question";
        questionDiv.style.display = "flex";
        questionDiv.style.justifyContent = "space-between"
        questionDiv.setAttribute("index", id);
        questionDiv.innerHTML = `
                <div>
                    <h3>${subject}</h3>
                    <p>${question}</p>
                </div>
                <div>
                    <p class="star">☆</p>
                    <p class="time"></p>
                </div>
            `;
        questionArea.appendChild(questionDiv);
        subjectInput.value = "";
        questionTextarea.value = "";
    });

    const renderQuestion = () => {
        questionArea.innerHTML = "";
        arr.forEach((item, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.className = "question";
            questionDiv.style.display = "flex";
            questionDiv.style.justifyContent = "space-between"
            questionDiv.setAttribute("index", item.id);
            const emoji = (arr[index].flag == 0) ? "☆" : "★";
            questionDiv.innerHTML = `
                <div>
                    <h3>${item.subject}</h3>
                    <p>${item.question}</p>
                    
                </div>
                <div>
                    <p class="star">${emoji}</p>
                    <p class="time"></p>
                </div>
            `;
            questionArea.appendChild(questionDiv);
        });
    };

    renderQuestion();

    questionArea.addEventListener("click", (event) => {
        const clickedElement = event.target.closest(".question");
        const clickedStar = event.target.classList.contains("star");
        const index = clickedElement.getAttribute("index");
        current_index = arr.findIndex((item) => item.id == index);

        if (clickedStar) {
            const starDiv = event.target.closest(".question");
            const star = starDiv.querySelector(".star");
            if (!showFavourite && star.innerHTML == "★") {
                star.innerHTML = "☆";
                starDiv.style.display = "none";
                disable -= 1;
                arr[current_index].flag = 0;
                if (disable == 0) {
                    showFavourite = false;
                    favourite.click();
                    favourite.setAttribute("disabled", "true");
                }
            }
            else if (star.innerHTML == "☆") {
                star.innerHTML = "★";
                disable += 1;
                favourite.removeAttribute("disabled");
                arr[current_index].flag = 1;
            }
            else {
                star.innerHTML = "☆"
                disable -= 1;
                arr[current_index].flag = 0;
                if (disable === 0) {
                    favourite.setAttribute("disabled", "true");
                }
            }
            console.log(arr);
            localStorage.setItem("questions", JSON.stringify(arr));
        }
        else if (clickedElement) {
            secondBlock.style.display = "none";
            thirdBlock.style.display = "block";
            comm.style.display = "block";

            const subject = clickedElement.querySelector("h3").textContent;
            const description = clickedElement.querySelector("p").textContent;
            questionDetail.innerHTML = `
                <h3>${subject}</h3>
                <p>${description}</p>
            `;

            comm.innerHTML = "";

            current_reference = clickedElement;
            renderComment();
        }
    });

    const renderComment = () => {
        if (current_index === null || !arr[current_index]?.answer) {
            console.error("No question selected or no answers available.");
            return;
        }

        const answers = arr[current_index].answer;
        comm.innerHTML = "";

        const sortedComments = Object.entries(answers).sort(([, a], [, b]) => {
            const diffA = a.likes - a.dislikes;
            const diffB = b.likes - b.dislikes;
            return diffB - diffA;
        });

        sortedComments.forEach(([name, responseObj]) => {
            const comment = document.createElement("div");
            comment.className = "comment";
            comment.innerHTML = `
                <strong>${name}</strong><br>
                <p>${responseObj.ans}</p><br>
                <span class="like">👍 ${responseObj.likes}</span> 
                <span class="dislike">👎 ${responseObj.dislikes}</span>
            `;
            comm.appendChild(comment);
        });
    };



    remove.addEventListener("click", () => {
        if (current_index === null || current_reference === null) {
            alert("No question selected for removal.");
            return;
        }

        arr.splice(current_index, 1);
        localStorage.setItem("questions", JSON.stringify(arr));
        current_reference.remove();

        current_reference = null;
        current_index = null;

        secondBlock.style.display = "block";
        thirdBlock.style.display = "none";
        comm.style.display = "none";
    });

    response.addEventListener("click", () => {
        const name = document.getElementById("name").value.trim();
        const ans = document.getElementById("answer").value.trim();

        if (!(name && ans)) {
            alert("Please fill all the fields");
            return;
        }
        let likes = 0;
        let dislikes = 0;

        if (!arr[current_index].answer[name]) {
            arr[current_index].answer[name] = { ans, likes, dislikes };
        } else {
            arr[current_index].answer[name].ans = ans;
        }

        localStorage.setItem("questions", JSON.stringify(arr));

        if (comm) {
            const comment = document.createElement("div");
            comment.className = "comment";
            comment.innerHTML = `
                <strong>${name}</strong> <br> <p>${ans}</p><br>
                    <span class="like">👍 ${likes}</span>
                    <span class="dislike"> 👎 ${dislikes}</span>
            `;
            comm.appendChild(comment);
        }

        document.getElementById("name").value = "";
        document.getElementById("answer").value = "";
        renderComment();
    });

    comm.addEventListener("click", (event) => {
        const clickedComment = event.target.closest(".comment");
        const clickedLike = event.target.closest(".like");
        const clickedDislike = event.target.closest(".dislike");

        if (!(clickedComment && (clickedLike || clickedDislike))) {
            return;
        }

        const name = clickedComment.querySelector("strong")?.textContent;
        const commentData = arr[current_index]?.answer?.[name];
        if (!commentData) {
            console.error("Comment data not found in arr.");
            return;
        }

        if (clickedLike) {
            commentData.likes += 1;
        } else if (clickedDislike) {
            commentData.dislikes += 1;
        }

        const diffCurrent = commentData.likes - commentData.dislikes;

        const likeElement = clickedComment.querySelector(".like");
        const dislikeElement = clickedComment.querySelector(".dislike");

        if (likeElement) likeElement.textContent = `👍 ${commentData.likes}`;
        if (dislikeElement) dislikeElement.textContent = `👎 ${commentData.dislikes}`;

        const allComments = Array.from(comm.children);
        comm.removeChild(clickedComment);

        let inserted = false;
        for (let i = 0; i < allComments.length; i++) {
            const otherComment = allComments[i];
            const otherName = otherComment.querySelector("strong")?.textContent;
            const otherData = arr[current_index]?.answer?.[otherName];

            const diffOther = (otherData?.likes || 0) - (otherData?.dislikes || 0);

            if (diffCurrent > diffOther) {
                comm.insertBefore(clickedComment, otherComment);
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            comm.appendChild(clickedComment);
        }

        localStorage.setItem("questions", JSON.stringify(arr));
    });

    question_form.addEventListener("click", () => {
        secondBlock.style.display = "block";
        thirdBlock.style.display = "none";
        comm.style.display = "none";
        subjectInput.value = "";
        questionTextarea.value = "";
    });

    favourite.addEventListener("click", () => {
        arr.forEach((item) => {
            const element = document.querySelector(`.question[index="${item.id}"]`);
            if (showFavourite && item.flag === 0) {
                if (element) element.style.display = "none";
            } else {
                if (element) element.style.display = "flex";
            }
        });
        favourite.innerText = showFavourite ? "Show All" : "Favourite";
        showFavourite = !showFavourite;
    });

    searchBar.addEventListener("input", (event) => {
        const query = event.target.value.trim();
        const dummyElement = document.querySelector(".question.dummy") || document.createElement("div");
    
        if (!dummyElement.parentNode) {
            dummyElement.className = "question dummy";
            dummyElement.style.display = "none";
            dummyElement.innerHTML = `
                <div>
                    <h3>&nbsp;</h3>
                    <p>&nbsp;</p>
                </div>
            `;
            questionArea.insertBefore(dummyElement, questionArea.firstChild);
        }
    
        const regex = new RegExp(`^(${query})`, "i");
    
        const questions = document.querySelectorAll("#questions .question:not(.dummy)");
    
        if (!query) {
            questions.forEach((question) => {
                const curr = question.getAttribute("index");
                const ind = arr.findIndex((item) => item.id == curr);
    
                question.style.display = showFavourite || arr[ind]?.flag === 1 ? "flex" : "none";
    
                const subjectElement = question.querySelector("h3");
                const descriptionElement = question.querySelector("p");
    
                subjectElement.innerHTML = subjectElement.textContent;
                descriptionElement.innerHTML = descriptionElement.textContent;
            });
            dummyElement.remove();
            return;
        }
    
        const matchedSubjectQuestions = [];
        const matchedDescriptionQuestions = [];
    
        questions.forEach((question) => {
            const subject = question.querySelector("h3").textContent.trim();
            const curr = question.getAttribute("index");
            const ind = arr.findIndex((item) => item.id == curr);
    
            if (!showFavourite && arr[ind]?.flag != 1) {
                question.style.display = "none";
                return;
            }
            if (regex.test(subject)) {
                matchedSubjectQuestions.push(question);
                question.style.display = "flex";
                question.querySelector("h3").innerHTML = subject.replace(regex, `<span class="highlight">$1</span>`); // Highlight matched text
            } else {
                question.style.display = "none";
            }
        });
    
        matchedSubjectQuestions.forEach((question) => {
            questionArea.insertBefore(question, dummyElement);
        });
    
        questions.forEach((question) => {
            const curr = question.getAttribute("index");
            const ind = arr.findIndex((item) => item.id == curr);
    
            if (!showFavourite && arr[ind]?.flag != 1) {
                question.style.display = "none";
                return;
            }
            if (matchedSubjectQuestions.includes(question)) {
                return;
            }
    
            const quest = question.querySelector("p").textContent.trim();
            if (regex.test(quest)) {
                matchedDescriptionQuestions.push(question);
                question.style.display = "flex";
                question.querySelector("p").innerHTML = quest.replace(regex, `<span class="highlight">$1</span>`); // Highlight matched text
            } else {
                question.style.display = "none";
            }
        });
    
        matchedDescriptionQuestions.forEach((question) => {
            questionArea.insertBefore(question, dummyElement);
        });
        questionArea.insertBefore(dummyElement, questionArea.firstChild);
    });
});    
