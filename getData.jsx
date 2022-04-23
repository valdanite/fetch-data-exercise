const Pagination = ({ items, pageSize, onPageChange }) => {
    
    if (items.length <= 1) return null;

    const { Button } = ReactBootstrap;
    let num = Math.ceil(items.length / pageSize);

    const range = (start, end) => {
        return new Array(end - start).fill(0).map((item, i) => start + i);
    };

    let pages = range(1, num + 1);

    const list = pages.map(page => {
        return (
            <Button key={page} onClick={onPageChange} className="page-item">
                {page}
            </Button>
        )
    });

    return (
        <nav>
            <ul className="pagination">{list}</ul>
        </nav>
    );
};

const dataFetchReducer = (state, action) => {
    switch(action.type) {
        case "FETCH_INIT":
            return {
                ...state,
                isLoading: true,
                isError: false
            };
        case "FETCH_SUCCESS":
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload
            };
        case "FETCH_FAILURE":
            return {
                ...state,
                isLoading: false,
                isError: true
            };
        default:
            throw new Error();
    };
};

const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);

    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: false,
        isError: false,
        data: initialData
    });

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: "FETCH_INIT" });
            try {
                const result = await axios(url);
                dispatch({ type: "FETCH_SUCCESS", payload: result.data });
            } catch (error) {
                dispatch({ type: "FETCH_FAILURE" });
            }
        };
        fetchData();
    }, [url]);
    return [state, setUrl];
};

function App() {
    const { useState } = React;
    const [query, setQuery] = useState("MIT");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;
    let page = [];
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
        "https://hn.algolia.com/api/v1/search?query=MIT",
        {
            hits: []
        }
    );
    
    const handlePageChange = e => {
        setCurrentPage(Number(e.target.textContent));
    };

    function paginate(items, pageNumber, pageSize) {
        const start = (pageNumber - 1) * pageSize;
        let page = items.slice(start, start + pageSize);
        return page;
    };

    if (data.hits.length >= 1) {
        page = paginate(data.hits, currentPage, pageSize);
        console.log(`currentPage: ${currentPage}`);
    }

    return (
        <>
            <form onSubmit={e => {
                doFetch(`http://hn.algolia.com/api/v1/search?query=${query}`)
                e.preventDefault();
            }}>
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}/>
                <button type="submit">Search</button>
            </form>
            { isError && <div>something went wrong ...</div> }
            { isLoading ? (
                <div>Loading...</div>
            ) : (
                <ul className="list-group">
                    {page.map(item => (
                        <li className="list-group-item" key={item.objectID}>
                            <a href={item.url}>{item.title}</a>
                        </li>
                    ))}
                </ul>
            )}
            <Pagination
                items={data.hits}
                pageSize={pageSize}
                onPageChange={handlePageChange}
            ></Pagination>
        </>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));