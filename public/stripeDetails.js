var stripe;
var elements;
function startloading() {
    const ele = document.getElementById('continue');
    ele.innerText = 'PROCESSING...';
    ele.setAttribute('style', 'pointer-events:none;cursor:loading');
}
function stoploading() {
    const ele = document.getElementById('continue');
    ele.innerText = 'CONTINUE';
    ele.setAttribute('style', 'pointer-events:all;cursor:pointer');
}
