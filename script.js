
// script.js

const typed = new Typed('.multiple-text',{
    strings :[' Full Stack  ','Front End ','Back End ','ML'],
    typeSpeed:100,
    backSpeed:100,
    backDealy:100,
    loop :true
});

// circle skill///////////////////////////////////////////////////////////////////////////////
const circles= document.querySelectorAll('.circle');
circles.forEach(elem=>{
    var dots=elem.getAttribute("data-dots");
    var marked=elem.getAttribute("data-percent");
    var parcent=Math.floor(dots*marked/100);
    var points="";
    var rotate=360/dots;
    for(let i=0;i<dots;i++)
    {
        points+=`<div class="points" style="--i:${i}; --rot:${rotate}deg"></div>`
    }
    elem.innerHTML=points;
    const pointsMarked=elem.querySelectorAll('.points');
    for(let i=0;i<parcent;i++)
    {
        pointsMarked[i].classList.add('marked')
    }
});

// ------------------------------------mix it in the portfolio Selection.--------------------------------------------------
var mixer = mixitup('.portfolio-gallery');
