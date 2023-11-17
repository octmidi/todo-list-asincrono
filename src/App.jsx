import { useState, useEffect } from 'react';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { InputGroup, FormControl, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';

function App() {
  const [inputText, setInputText] = useState('');
  const [listItems, setListItems] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    obtenerListaDeTareas();
  }, []);

  const obtenerListaDeTareas = () => {
    axios.get('https://playground.4geeks.com/apis/fake/todos/user/octmidi')
      .then(response => {
        setListItems(response.data);
      })
      .catch(error => {
        console.error('Error al obtener la lista de tareas:', error.response);
      });
  };

  const handleInputChange = (e) => {
    const capitalizedText = e.target.value
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toLocaleUpperCase());

    setInputText(capitalizedText);
  }

  const handleAddItem = () => {
    if (inputText.trim() !== '') {
      const nuevaTarea = { label: inputText, done: false };
      setListItems([...listItems, nuevaTarea]);
      setInputText('');

      actualizarListaEnServidor([...listItems, nuevaTarea]);
    }
  };

  const handleKeyPress = (e) => {
    const regex = /^(?=[a-zA-Z]{2})[\s\w\d]*$/;

    if (e.key === 'Enter') {
      if (regex.test(inputText)) {
        handleAddItem();
      } else {
        setInputText('');
        alert('La cadena no cumple con los requisitos mínimos. Los primeros dos caracteres deben ser letras');
      }
    }
  };

  const handleRemoveItem = (index) => {
    const nuevaLista = [...listItems];
    nuevaLista.splice(index, 1);
    setListItems(nuevaLista);
    actualizarListaEnServidor(nuevaLista);
  };

  const actualizarListaEnServidor = (nuevaLista) => {
    axios.put('https://playground.4geeks.com/apis/fake/todos/user/octmidi', nuevaLista)
      .then(response => {
        console.log('Lista de tareas actualizada en el servidor:', response.data);
      })
      .catch(error => {
        console.error('Error al actualizar la lista de tareas en el servidor:', error.response);
      });
  };

  return (
    <>
      <div className='div-back'><h1>Todos</h1></div>
      <div className='list stacked'>
        <ListGroup className='group'>
          <InputGroup className="mb-3">
            <FormControl
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Ingrese un elemento y presione Enter"
            />
          </InputGroup>
          {listItems.map((item, index) => (
            <ListGroup.Item
              key={index}
              className='left-aligned-item'
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {item.label}
              {hoveredIndex === index && (
                <Badge bg="Light" pill className='icon' onClick={() => handleRemoveItem(index)}>
                  '❌'
                </Badge>
              )}
            </ListGroup.Item>
          ))}
          <ListGroup.Item className='total'>{listItems.length} item left</ListGroup.Item>
        </ListGroup>
      </div>
    </>
  );
}

export default App;
