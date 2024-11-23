import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup} from 'react-bootstrap';
import axios from 'axios';

const axiosApi = axios.create({
  baseURL:
    'https://alexandrk-server-default-rtdb.europe-west1.firebasedatabase.app/',
});

interface Category {
  id: string;
  name: string;
  type: 'Income' | 'Expense';
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryData, setCategoryData] = useState({ name: '', type: 'Income' });

  const fetchCategories = async () => {
    try {
      const response = await axiosApi.get('/categories.json');
      const categoriesData = response.data;
      if (categoriesData) {
        const loadedCategories: Category[] = Object.keys(categoriesData).map((key) => ({
          id: key,
          name: categoriesData[key].name,
          type: categoriesData[key].type,
        }));
        setCategories(loadedCategories);
      }
    } catch (error) {
      console.error('Error loading', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    try {
      const response = await axiosApi.post('/categories.json', categoryData);
      const newCategory = { id: response.data.name, ...categoryData };
      setCategories([...categories, newCategory]);
      resetModal();
    } catch (error) {
      console.error('Error while adding', error);
    }
  };

  const handleEditCategory = async () => {
    if (selectedCategory) {
      try {
        await axiosApi.put(`/categories/${selectedCategory.id}.json`, categoryData);
        const updatedCategories = categories.map((category) =>
          category.id === selectedCategory.id
            ? { ...category, ...categoryData }
            : category
        );
        setCategories(updatedCategories);
        resetModal();
      } catch (error) {
        console.error('Error during update', error);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Do you want to delete this category?')) {
      try {
        await axiosApi.delete(`/categories/${id}.json`);
        setCategories(categories.filter((category) => category.id !== id));
      } catch (error) {
        console.error('Delete error', error);
      }
    }
  };

  const openAddModal = () => {
    setCategoryData({ name: '', type: 'Income' });
    setSelectedCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setCategoryData({ name: category.name, type: category.type });
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setCategoryData({ name: '', type: 'Income' });
    setSelectedCategory(null);
  };

  return (
    <div>
      <div className="d-flex justify-content-between">
        <h2>Categories</h2>
        <Button className="mb-3" variant="primary" onClick={openAddModal}>
          Add category
        </Button>
      </div>

      <ListGroup>
        {categories.map((category) => (
          <ListGroup.Item key={category.id} className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{category.name}</strong> ({category.type})
            </div>
            <div>
              <Button variant="warning" onClick={() => openEditModal(category)} className="me-2">
                Edit
              </Button>
              <Button variant="danger" onClick={() => handleDeleteCategory(category.id)}>
                Delete
              </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>


      <Modal show={showModal} onHide={resetModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedCategory ? 'Edit' : 'Add'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formCategoryName">
              <Form.Label>Name category</Form.Label>
              <Form.Control
                type="text"
                placeholder="name"
                value={categoryData.name}
                onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formCategoryType" className="mt-3">
              <Form.Label>Type category</Form.Label>
              <Form.Control
                as="select"
                value={categoryData.type}
                onChange={(e) => setCategoryData({ ...categoryData, type: e.target.value as 'Income' | 'Expense' })}
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
          >
            {selectedCategory ? 'Save' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Categories;