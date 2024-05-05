// Event listener for the "Get Started" button
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.hero button');
    button.addEventListener('click', () => {
        alert('Get Started button clicked!');
    });
});
