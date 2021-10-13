import React, {useState } from 'react'
import { Form, Button } from "react-bootstrap"
import axios from 'axios';

const CheckRegister = () => {
    const [checkRegister, setCheckRegister] = useState({ hid: "" })
    const registerHandle = (e) => {
        console.log(e.target.value)
        setCheckRegister({ [e.target.name]: e.target.value })
    }
    const registerOnSubmit = (e) => {
        e.preventDefault();
        const h_id = {
            hid: checkRegister.hid
        }
        axios.post("http://localhost:3000/checkregister", { h_id })
            .then(res => {
                console.log(res.data);
            })
    }
    return (
        <>
            <h1>Check Register</h1>
            <Form onSubmit={registerOnSubmit}>
                <Form.Group className="mb-3" controlId="hid">
                    <Form.Label>Check Register</Form.Label>
                    <Form.Control type="text" name="hid" onChange={registerHandle} placeholder="HID" />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Check Register
                </Button>
            </Form>
        </>
    )
}
export default CheckRegister