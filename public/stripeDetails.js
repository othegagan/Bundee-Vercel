var stripe;
var elements;
function startloading() {
    let ele = document.getElementById('continue');
    ele.innerText = 'PROCESSING...';
    ele.setAttribute('style', 'pointer-events:none;cursor:loading');
}
function stoploading() {
    let ele = document.getElementById('continue');
    ele.innerText = 'CONTINUE';
    ele.setAttribute('style', 'pointer-events:all;cursor:pointer');
}
