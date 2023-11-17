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
        // Filtrar solo los elementos con done: true
        const tareasCompletadas = response.data.filter(task => task.done);
        setListItems(tareasCompletadas);
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
      const nuevaTarea = { label: inputText, done: true };

      axios.put('https://playground.4geeks.com/apis/fake/todos/user/octmidi', [...listItems, nuevaTarea])
        .then(response => {
          console.log('Lista de tareas actualizada en el servidor:', response.data);
          setListItems([...listItems, nuevaTarea]); // Solo actualiza la lista local si la actualización en el servidor es exitosa
          setInputText('');
        })
        .catch(error => {
          console.error('Error al actualizar la lista de tareas en el servidor:', error.response);
          // Puedes manejar el error aquí según tus necesidades, por ejemplo, mostrando una alerta
          // No actualices la lista local en caso de un error
        });
    }
  };


  const handleDeleteAll = () => {
    // Filtrar solo las tareas completadas
    const tasksToDelete = listItems.filter(item => item.done === true);

    // Borrar solo las tareas completadas en el servidor
    axios.delete('https://playground.4geeks.com/apis/fake/todos/user/octmidi', {
      data: { tasks: tasksToDelete }
    })
      .then(response => {
        console.log('Todas las tareas completadas borradas en el servidor:', response.data);

        // Actualizar la lista local excluyendo las tareas borradas
        const updatedList = listItems.filter(item => item.done !== true);
        setListItems(updatedList);

        // Update the server with the entire updated list
        actualizarListaEnServidor(updatedList);
      })
      .catch(error => {
        console.error('Error al borrar tareas en el servidor:', error.response);
      });
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
        setListItems(nuevaLista);
      })
      .catch(error => {
        console.error('Error al actualizar la lista de tareas en el servidor:', error.response);
      });
  };

  return (
    <>
      <div className='div-back'><h1>Todos</h1></div>
      <div className='list stacked list_stacked'>
        <ListGroup className='group'>
          <InputGroup className="mb-3">
            <FormControl
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Enter an item and press enter"

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
          <ListGroup.Item className="btn">
            <button className="btn btn-danger btn" onClick={() => handleDeleteAll()}>Delete All </button>
          </ListGroup.Item>

        </ListGroup>

      </div>
    </>

  );
}

export default App;
