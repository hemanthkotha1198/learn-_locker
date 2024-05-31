function addProject() {
    // Implement logic to submit the form data to the backend
    // You can use JavaScript fetch API or any other method to send data to the server
    // Example:
    const projectName = document.getElementById('projectName').value;
    const technology = document.getElementById('technology').value;
    const description = document.getElementById('description').value;
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
  
    const formData = new FormData();
    formData.append('projectName', projectName);
    formData.append('technology', technology);
    formData.append('description', description);
    formData.append('file', file);
  
    // Replace the URL with the actual endpoint to handle project addition
    fetch('your_backend_endpoint', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      // Handle the response from the server
      console.log('Project added successfully:', data);
    })
    .catch(error => {
      console.error('Error adding project:', error);
    });
  }
  