import "./index.css";

const Transactions = (props) => {
  const { transactionsDetails, page, increment, decrement } = props;
  const { transactions, total } = transactionsDetails;
  const incrementPage = () => {
    increment();
  };
  const decrementPage = () => {
    decrement();
  };
  const renderTableData = () => {
    return (
      <>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Sold</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((eachData) => (
              <tr key={eachData.id}>
                <td>{eachData.id}</td>
                <td>{eachData.title}</td>
                <td>{eachData.description}</td>
                <td>{Math.round(eachData.price * 100) / 100}</td>
                <td>{eachData.category}</td>
                <td>{eachData.sold ? "True" : "False"}</td>
                <td>
                  <img
                    src={eachData.image}
                    alt="product"
                    className="product-img"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-container">
          <p>Page No: {page}</p>
          <div>
            <button
              type="button"
              onClick={incrementPage}
              disabled={page === Math.ceil(total.total / 10)}
            >
              Next
            </button>
            <span> - </span>
            <button type="button" onClick={decrementPage} disabled={page === 1}>
              Previous
            </button>
          </div>
          <p>Per Page: 10</p>
        </div>
      </>
    );
  };
  const renderNoData = () => {
    return (
      <div>
        <h1>No Transactions</h1>
      </div>
    );
  };
  return (
    <div className="table-container">
      {transactions.length > 0 ? renderTableData() : renderNoData()}
    </div>
  );
};

export default Transactions;