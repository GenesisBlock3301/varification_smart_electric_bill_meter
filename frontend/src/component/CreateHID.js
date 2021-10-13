import React, { useEffect, useState } from 'react'
import { Form, Button, Container } from "react-bootstrap"
import axios from 'axios';
import Register from './Register';
import CheckRegister from './CheckRegister';


const CreateHID = () => {

    const [createHID, setCreateHID] = useState({ hid: "" })
    const createHIdHandle = (e) => {
        console.log(e.target.value)
        setCreateHID({ [e.target.name]: e.target.value })
    }

    const HIDOnSubmit = (e) => {
        e.preventDefault();
        const h_id = {
            hid: createHID.hid
        }
        axios.post("http://localhost:3000/hid", { h_id })
            .then(res => {
                console.log(res.data);
            })
    }
    return (
        <Container>
            <h1>CreateHID</h1>
            <Form onSubmit={HIDOnSubmit}>
                <Form.Group className="mb-3" controlId="hid">
                    <Form.Label>HID</Form.Label>
                    <Form.Control type="text" onChange={createHIdHandle} name="hid" placeholder="HID" />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
            <Register />
            <CheckRegister />
        </Container>

    )
}
export default CreateHID