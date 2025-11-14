// Update Supabase query in Build component to include user profile data

import React from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const Build = () => {
    const [builds, setBuilds] = React.useState([]);

    React.useEffect(() => {
        const fetchBuilds = async () => {
            const { data, error } = await supabase
                .from('builds')
                .select('*, profiles:user_id (name, avatar_url)'); // Updated selection
            if (error) console.log('Error fetching builds:', error);
            else setBuilds(data);
        };
        fetchBuilds();
    }, []);

    return (
        <div>
            <h1>Builds</h1>
            <ul>
                {builds.map(build => (
                    <li key={build.id}>
                        <h2>{build.title}</h2>
                        <p>Created by: {build.profiles.name}</p>
                        <img src={build.profiles.avatar_url} alt={`${build.profiles.name}'s avatar`} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Build;