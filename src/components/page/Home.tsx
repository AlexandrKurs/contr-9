import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Alert,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import axios from "axios";

interface Category {
  id: string;
  name: string;
  type: "Income" | "Expense";
}

interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: "Income" | "Expense";
  createdAT: string;
}

const axiosApi = axios.create({
  baseURL:
    "https://alexandrk-server-default-rtdb.europe-west1.firebasedatabase.app/",
});

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [transactionData, setTransactionData] = useState({
    type: "Income",
    category: "",
    amount: 0,
  });
  const [alertMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCategories = async () => {
    try {
      const response = await axiosApi.get("/categories.json");
      const categoriesData = response.data;
      if (categoriesData) {
        const loadedCategories: Category[] = Object.keys(categoriesData).map(
          (key) => ({
            id: key,
            name: categoriesData[key].name,
            type: categoriesData[key].type,
          }),
        );
        setCategories(loadedCategories);
      }
    } catch (error) {
      console.error("Error load categories", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axiosApi.get("/transactions.json");
      const transactionsData = response.data;
      if (transactionsData) {
        const loadedTransactions: Transaction[] = Object.keys(
          transactionsData,
        ).map((key) => ({
          id: key,
          ...transactionsData[key],
        }));
        setTransactions(loadedTransactions);
      }
    } catch (error) {
      console.error("Error load Transaction", error);
    }
  };

  const handleChangeTransactionData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setTransactionData({
      ...transactionData,
      [e.target.name]: e.target.value,
    });
  };

  const openAddModal = () => {
    setTransactionData({ type: "Income", category: "", amount: 0 });
    setSelectedTransaction(null);
    setShowModal(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
    });
    setShowModal(true);
  };

  const handleAddTransaction = async () => {
    setLoading(true);
    try {
      const createdAT = new Date().toISOString();
      const newTransaction = {
        ...transactionData,
        createdAT,
      };
      const response = await axiosApi.post(
        "/transactions.json",
        newTransaction,
      );
      const addedTransaction = { id: response.data.name, ...newTransaction };
      setTransactions([...transactions, addedTransaction]);
      resetModal();
    } catch (error) {
      console.error("Error add Transaction", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = async () => {
    setLoading(true);
    if (selectedTransaction) {
      try {
        await axiosApi.put(
          `/transactions/${selectedTransaction.id}.json`,
          transactionData,
        );
        const updatedTransactions: Transaction[] = transactions.map(
          (transaction) =>
            transaction.id === selectedTransaction.id
              ? { ...transaction, ...transactionData }
              : transaction,
        );
        setTransactions(updatedTransactions);
        resetModal();
      } catch (error) {
        console.error("Error update Transaction", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm("Do you want to delete this category?")) {
      setLoading(true);
      axiosApi
        .delete(`/transactions/${id}.json`)
        .then(() => {
          const updatedTransactions = transactions.filter(
            (transaction) => transaction.id !== id,
          );
          setTransactions(updatedTransactions);
        })
        .catch((error) => {
          console.error("Error delete transaction", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setTransactionData({ type: "Income", category: "", amount: 0 });
    setSelectedTransaction(null);
  };

  const filteredCategories = categories.filter(
    (category) => category.type === transactionData.type,
  );

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  const getAmountClass = (type: "Income" | "Expense") => {
    return type === "Income" ? "text-success" : "text-danger";
  };

  const calculateTotalAmount = () => {
    return transactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amount.toString());
      if (transaction.type === "Income") {
        return total + amount;
      } else {
        return total - amount;
      }
    }, 0);
  };

  const totalAmount = calculateTotalAmount();
  const formattedTotalAmount = totalAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div>
      <header className="mb-4">
        <Button variant="primary" onClick={openAddModal}>
          Add transaction
        </Button>
      </header>

      {alertMessage && <Alert variant="success">{alertMessage}</Alert>}

      <div>
        <h3>List transactions</h3>
        <ListGroup>
          {transactions.map((transaction) => (
            <ListGroup.Item
              key={transaction.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <span className="me-4">
                  {new Date(transaction.createdAT).toLocaleString()}
                </span>
                <span className="fw-bold">{transaction.category}</span>
              </div>
              <div>
                <span className={getAmountClass(transaction.type)}>
                  <strong>
                    {transaction.type === "Expense" ? "-" : "+"}
                    {transaction.amount} KGS
                  </strong>
                </span>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => openEditModal(transaction)}
                  className="me-2 ms-3"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteTransaction(transaction.id)}
                >
                  Delete
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>

      <div className="mt-4">
        <h4>
          Total: <strong>{formattedTotalAmount} KGS</strong>
        </h4>
      </div>

      <Modal show={showModal} onHide={resetModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedTransaction ? "Edit transaction" : "Add transaction"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="type">
              <Form.Label>Type transaction</Form.Label>
              <Form.Control
                as="select"
                value={transactionData.type}
                name="type"
                onChange={handleChangeTransactionData}
              >
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Control
                as="select"
                value={transactionData.category}
                name="category"
                onChange={handleChangeTransactionData}
              >
                <option value="">Enter category</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="amount">
              <Form.Label>Sum</Form.Label>
              <Form.Control
                type="number"
                value={transactionData.amount}
                name="amount"
                onChange={handleChangeTransactionData}
                min="0"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetModal}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={
              selectedTransaction ? handleEditTransaction : handleAddTransaction
            }
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : selectedTransaction ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Home;
