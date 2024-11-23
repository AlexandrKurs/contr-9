import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  ListGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import axios from "axios";

interface Category {
  id: string;
  name: string;
  type: "Income" | "Expense";
}

const axiosApi = axios.create({
  baseURL:
    "https://alexandrk-server-default-rtdb.europe-west1.firebasedatabase.app/",
});

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [categoryData, setCategoryData] = useState({
    name: "",
    type: "Income",
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [loading, setLoading] = useState(false); // Для отслеживания состояния загрузки
  const [alertMessage] = useState<string>("");

  const fetchCategories = async () => {
    setLoading(true);
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
      console.error("Ошибка при загрузке категорий", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChangeCategoryData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setCategoryData({
      ...categoryData,
      [e.target.name]: e.target.value,
    });
  };

  const openAddModal = () => {
    setCategoryData({ name: "", type: "Income" });
    setSelectedCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setCategoryData({
      name: category.name,
      type: category.type,
    });
    setShowModal(true);
  };

  const handleAddCategory = async () => {
    setLoading(true);
    try {
      const newCategory = { ...categoryData };
      const response = await axiosApi.post("/categories.json", newCategory);
      const addedCategory = { id: response.data.name, ...newCategory };
      setCategories([...categories, addedCategory]);
      resetModal();
    } catch (error) {
      console.error("Error adding", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (selectedCategory) {
      setLoading(true);
      try {
        await axiosApi.put(
          `/categories/${selectedCategory.id}.json`,
          categoryData,
        );
        const updatedCategories: Category[] = categories.map((category) =>
          category.id === selectedCategory.id
            ? { ...category, ...categoryData }
            : category,
        );
        setCategories(updatedCategories);
        resetModal();
      } catch (error) {
        console.error("Error update", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm("Do you want to delete this category?")) {
      setLoading(true);
      axiosApi
        .delete(`/categories/${id}.json`)
        .then(() => {
          const updatedCategories = categories.filter(
            (category) => category.id !== id,
          );
          setCategories(updatedCategories);
        })
        .catch((error) => {
          console.error("Error delete", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setCategoryData({ name: "", type: "Income" });
    setSelectedCategory(null);
  };

  return (
    <div>
      <header className="mb-4">
        <Button variant="primary" onClick={openAddModal}>
          Add category
        </Button>
      </header>

      {alertMessage && <Alert variant="success">{alertMessage}</Alert>}

      <div>
        <h3>List category</h3>
        <ListGroup>
          {categories.map((category) => (
            <ListGroup.Item
              key={category.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{category.name}</strong> - {category.type}
              </div>
              <div>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => openEditModal(category)}
                  className="me-2"
                  disabled={loading}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>

      <Modal show={showModal} onHide={resetModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedCategory ? "Update category" : "Add category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="name">
              <Form.Label>Name category</Form.Label>
              <Form.Control
                type="text"
                value={categoryData.name}
                name="name"
                onChange={handleChangeCategoryData}
                placeholder="Enter name category"
              />
            </Form.Group>
            <Form.Group controlId="type">
              <Form.Label>Type category</Form.Label>
              <Form.Control
                as="select"
                value={categoryData.type}
                name="type"
                onChange={handleChangeCategoryData}
              >
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetModal}>
            Закрыть
          </Button>
          <Button
            variant="primary"
            onClick={selectedCategory ? handleEditCategory : handleAddCategory}
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : selectedCategory ? (
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

export default Categories;