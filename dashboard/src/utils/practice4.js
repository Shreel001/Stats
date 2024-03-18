import React, { useState } from 'react';

function App() {
    const [moreText, setMoreText] = useState(false);
    const text = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and 
    scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, 
    remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
    and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`;

    return (
        <div>
            <h1>Toggle text</h1>
            <h6>
                {moreText ? text : `${text.substring(0, 250)}...`}
                <a className='btn' onClick={() => setMoreText(!moreText)}>
                    {moreText ? 'Show Less' : 'Show More'}
                </a>
            </h6>
        </div>
    );
}

export default App;
