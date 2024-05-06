import React from 'react';

export default function page() {
    fetch('/api/test', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Handle the data received from the API endpoint
        })
        .catch(error => {
            // Handle any errors that occur during the API call
        });
    return <div>page</div>;
}
