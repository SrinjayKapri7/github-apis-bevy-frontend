import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./App.css"

function App() {
  const [keyword, setKeyword] = useState('All');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRepos = async (pageNum) => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/repos?page=${pageNum}&keyword=${keyword}`);
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
    if (page > 0) {
      fetchRepos(page);
    } else {
      setPage(1)
    }
  }, [page]);


  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword) return;

    if (keyword == "All") {
      return fetchRepos(1);
    }

    try {
      setLoading(true);
      await axios.post(`${process.env.REACT_APP_API_URL}/api/search`, { keyword });
      await fetchRepos(1); // Reload page 1 with new data
    } catch {
      setError('Search failed. Try again.');
    }
    setLoading(false);
  };


  const goToPage = (num) => {
    if (num >= 1 && num <= totalPages) {
      setPage(num);
    }
  };

  const handleClear = async () => {

    if (window.confirm("Are you sure you want to delete?")) {
      try {
        setLoading(true);
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/clear-repos`);
        setRepos([]);
        setTotalPages(0);
        setPage(0);
        setError('');
      } catch {
        setError('Failed to clear repositories.');
      }
      setLoading(false);
    } else {

      console.log("Cancelled");
    }

  }

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
        <button
          type="submit"
          className='submit-button'
        >
          Search
        </button>
        <button
          type="button"
          className='clear-btn'
          onClick={() => { handleClear() }}
        >
          Clear
        </button>
      </form>

      {error && <p className='error'>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <ul>
            {repos.map(repo => (
              <li key={repo.id} className='li-style'>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  {repo.full_name}
                </a>
                <p>{repo.description}</p>
                <small>Stars: {repo.stargazers_count}</small>
              </li>
            ))}
          </ul>
          {repos.length > 0 && <div className="pagination">

            <button onClick={() => goToPage(page - 1)} disabled={page <= 1}>Previous</button>
            <span className='span-page-no'>Page {page} of {totalPages}</span>
            <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>Next</button>

          </div>}
        </div>
      )}
    </div>
  );
}

export default App;

