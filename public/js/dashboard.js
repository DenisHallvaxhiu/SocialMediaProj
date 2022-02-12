// disable the post button on render
var postButton = document.getElementById('button-post-this');
postButton.disabled = true;
postButton.style.background = '#cccccc';
postButton.style.color = '#666666';

// add an onclick to each emoji selection, once clicked enable the post button 
var emojiOptions = document.getElementsByTagName('input');
for (var i in emojiOptions) {
    emojiOptions[i].onclick = function (e) {
        postButton.disabled = false;
        postButton.style.background = 'whitesmoke';
        postButton.style.border = 'none';
        postButton.style.color = 'black';
    }
}