import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API, Storage } from "aws-amplify";
import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import Navbar from "./components/Navbar";

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);

  const [createView, setCreateView] = useState({create_view: false,
                                                list_view: true})

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await Storage.get(note.name);
          note.image = url;
        }
        return note;
      })
    );
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image.name,
    };
    if (!!data.image) await Storage.put(data.name, image);
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }
  

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await Storage.remove(name);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  // Toggle what is shown on Screen
  function create_shown() {
    setCreateView(prevShown => ({create_view: true,
                                list_view: false}))
  }
  function create_hidden(){
    setCreateView(prevShown => ({create_view: false,
                                list_view: true}))
  }

  return (
    <View className="App">
      <Navbar show={create_shown} hide={create_hidden}/>
      <Heading level={2}>{createView.create_view ? "Workout Builder" : "Current Workouts"}</Heading>
      {createView.create_view && 
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="column" justifyContent="center">
          <TextField
            name="name"
            placeholder="Type of Workout/Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Workout Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <View
            name="image"
            as="input"
            type="file"
            style={{ alignSelf: "end" }}
          />
          <Button type="submit" variation="primary">
            Create Workout
          </Button>
        </Flex>
      </View>}

      {createView.list_view && <View margin="3rem 0">
      {notes.map((note) => (
        <Flex
          key={note.id || note.name}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Text as="strong" fontWeight={700}>
            {note.name}
          </Text>
          <Text as="span">{note.description}</Text>
          {note.image && (
            <Image
              src={note.image}
              alt={`visual aid for ${notes.name}`}
              style={{ width: 400 }}
            />
          )}
    <Button variation="link" onClick={() => deleteNote(note)}>
      Delete note
    </Button>
  </Flex>
))}
      </View>}
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);
