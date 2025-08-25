import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [keyword, setKeyword] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch stored repos for current page
  const fetchRepos = async (pageNum) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/repos?page=${pageNum}&keyword=${keyword}`);
      setRepos(res.data.repos);
      setTotalPages(res.data.totalPages);
      setPage(res.data.currentPage);
      setError('');
    } catch {
      setError('Failed to load repositories.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRepos(page);
  }, [page]);

  // Search form handler
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword) return;
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/search', { keyword });
      await fetchRepos(1); // Reload page 1 with new data
    } catch {
      setError('Search failed. Try again.');
    }
    setLoading(false);
  };

  // Pagination controls
  const goToPage = (num) => {
    if (num >= 1 && num <= totalPages) {
      setPage(num);
    }
  };

  return (
    <div style={{ margin: '2rem' }}>
      <h1>GitHub Repo Search</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          required
          style={{ padding: '0.5rem', width: '300px' }}
        />
        <button type="submit" style={{ padding: '0.5rem', marginLeft: '0.5rem' }}>Search</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <ul>
            {repos.map(repo => (
              <li key={repo.id} style={{ margin: '1rem 0' }}>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  {repo.full_name}
                </a>
                <p>{repo.description}</p>
                <small>Stars: {repo.stargazers_count}</small>
              </li>
            ))}
          </ul>
          <div>
            <button onClick={() => goToPage(page - 1)} disabled={page <= 1}>Previous</button>
            <span style={{ margin: '0 1rem' }}>Page {page} of {totalPages}</span>
            <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

