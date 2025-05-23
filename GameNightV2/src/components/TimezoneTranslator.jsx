// src/components/TimezoneTranslator.jsx
import React, { useState, useEffect } from 'react';
// Remove: import { zonedTimeToUtc, formatInTimeZone } from 'date-fns-tz';
import { format } from 'date-fns'; // Keep date-fns for initial date formatting if still needed
// NEW IMPORT: Luxon
import { DateTime } from 'luxon';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';

// A list of common timezones to offer. You can expand this if needed.
const COMMON_TIMEZONES = [
    'America/New_York',      // Eastern Time
    'America/Chicago',       // Central Time
    'America/Denver',        // Mountain Time
    'America/Los_Angeles',   // Pacific Time
    'America/Phoenix',       // Arizona (no DST)
    'America/Anchorage',     // Alaska Time
    'America/Honolulu',      // Hawaii Time
    'Europe/London',         // GMT/BST
    'Europe/Paris',          // CET/CEST
    'Europe/Berlin',         // CET/CEST
    'Asia/Tokyo',            // JST
    'Asia/Shanghai',         // CST
    'Australia/Sydney',      // AEDT/AEST
    'UTC',                   // Coordinated Universal Time
];

const TimezoneTranslator = () => {
    console.log('TimezoneTranslator component is rendering!');

    const [sourceTimezone, setSourceTimezone] = useState('America/New_York');
    const [sourceDateTime, setSourceDateTime] = useState(''); //YYYY-MM-DDTHH:MM format
    const [convertedTimes, setConvertedTimes] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('useEffect in TimezoneTranslator running!');
        // Set a default time to make it easier for the user
        const now = new Date();
        // Use Luxon to get current time in local timezone for the default
        // The default input type="datetime-local" expects local time without timezone offset
        const defaultDateTimeLuxon = DateTime.local().toFormat("yyyy-MM-dd'T'HH:mm");
        console.log('Default formatted time (Luxon):', defaultDateTimeLuxon);
        setSourceDateTime(defaultDateTimeLuxon);
    }, []);

    const handleConvert = (e) => {
        e.preventDefault();
        setError('');
        setConvertedTimes([]);

        if (!sourceDateTime) {
            setError('Please enter a date and time.');
            return;
        }

        try {
            // Luxon way to parse datetime-local string with an assumed timezone
            // It's crucial that sourceDateTime is correctly parsed in the context of sourceTimezone
            const sourceDt = DateTime.fromISO(sourceDateTime, { zone: sourceTimezone });

            console.log('Source DateTime (Luxon):', sourceDt.toISO()); // For debugging
            console.log('Source Timezone (Luxon):', sourceDt.zoneName); // For debugging

            if (!sourceDt.isValid) {
                throw new Error(`Invalid date and time format or timezone: ${sourceDt.invalidReason} - ${sourceDt.invalidExplanation}`);
            }

            const conversions = COMMON_TIMEZONES.map(targetTimezone => {
                // Change the timezone of the sourceDt to the target timezone
                const targetDt = sourceDt.setZone(targetTimezone);

                // Format the time in the target timezone
                // 'yyyy-MM-dd HH:mm (Z)' will give something like "2024-05-22 20:00 (-05:00)"
                // 'yyyy-MM-dd HH:mm (Z)' for offset, 'yyyy-MM-dd HH:mm (ZZZZ)' for long timezone name (e.g., Eastern Daylight Time)
                const formattedTime = targetDt.toFormat('yyyy-MM-dd HH:mm (Z)'); // Luxon uses 'Z' for offset

                console.log(`Converting to ${targetTimezone}: ${formattedTime}`);
                return {
                    timezone: targetTimezone,
                    time: formattedTime,
                    isSource: targetTimezone === sourceTimezone
                };
            });
            setConvertedTimes(conversions);
            console.log('Converted times set:', conversions);

        } catch (err) {
            console.error('Timezone conversion error:', err);
            setError(`Error converting time: ${err.message}`);
        }
    };

    return (
        <Card className="p-4 mb-4">
            <Card.Title className="text-center mb-4">Timezone Translator</Card.Title>
            <Form onSubmit={handleConvert}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="sourceTimezone">
                            <Form.Label>Your Timezone</Form.Label>
                            <Form.Control
                                as="select"
                                value={sourceTimezone}
                                onChange={(e) => setSourceTimezone(e.target.value)}
                            >
                                {COMMON_TIMEZONES.map(tz => (
                                    <option key={tz} value={tz}>
                                        {tz.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="sourceDateTime">
                            <Form.Label>Date and Time in Your Timezone</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={sourceDateTime}
                                onChange={(e) => setSourceDateTime(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Button variant="primary" type="submit" className="w-100 mb-3">
                    Convert Time
                </Button>
            </Form>

            {convertedTimes.length > 0 && (
                <div className="mt-4">
                    <h5>Converted Times:</h5>
                    <ul className="list-group">
                        {convertedTimes.map((item, index) => (
                            <li
                                key={index}
                                className={`list-group-item d-flex justify-content-between align-items-center ${item.isSource ? 'bg-info text-white' : ''}`}
                            >
                                <strong>{item.timezone.replace(/_/g, ' ')}:</strong>
                                <span>{item.time}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
};

export default TimezoneTranslator;