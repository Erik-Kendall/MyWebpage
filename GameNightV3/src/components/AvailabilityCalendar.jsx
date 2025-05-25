// src/components/AvailabilityCalendar.js

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Badge } from 'react-bootstrap'; // <--- ADDED THIS IMPORT

import '../App.css'; // Corrected: Importing App.css

// Add the new props for events
function AvailabilityCalendar({ eventsByDate, onEventClick }) {
    const [selectedDates, setSelectedDates] = useState(() => {
        const savedDates = localStorage.getItem('userAvailability');
        return savedDates ? new Set(JSON.parse(savedDates)) : new Set();
    });

    useEffect(() => {
        localStorage.setItem('userAvailability', JSON.stringify(Array.from(selectedDates)));
    }, [selectedDates]);

    const formatDateForStorage = (date) => {
        return date.toISOString().split('T')[0];
    };

    const handleDateClick = (date) => {
        const dateString = formatDateForStorage(date);
        setSelectedDates(prevDates => {
            const newDates = new Set(prevDates);
            if (newDates.has(dateString)) {
                newDates.delete(dateString);
            } else {
                newDates.add(dateString);
            }
            return newDates;
        });
    };

    // This function determines what content and class to apply to each tile
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateString = formatDateForStorage(date);
            const eventsForThisDate = eventsByDate.get(dateString);

            return (
                <div className="tile-content-wrapper">
                    {selectedDates.has(dateString) && (
                        <div className="availability-marker available"></div>
                    )}
                    {eventsForThisDate && eventsForThisDate.length > 0 && (
                        <div className="events-marker" onClick={(e) => {
                            e.stopPropagation(); // Prevent the tile click from also triggering
                            // You might want to show a modal or list of events here
                            // For now, let's just trigger the first event's details if onEventClick is provided
                            if (onEventClick && eventsForThisDate[0]) {
                                onEventClick(eventsForThisDate[0].id);
                            }
                        }}>
                            <Badge pill bg="info">{eventsForThisDate.length}</Badge> {/* Bootstrap Badge */}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };


    // This function determines what class to apply to each tile (for styling background)
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateString = formatDateForStorage(date);
            const classes = [];

            // Add availability class
            if (selectedDates.has(dateString)) {
                classes.push('react-calendar__tile--available');
            }

            // Add class if there are events on this date
            if (eventsByDate && eventsByDate.has(dateString)) {
                classes.push('react-calendar__tile--has-event');
            }

            // Disable past dates visually (already handled by minDate, but good for consistency)
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of today
            if (date < today) {
                classes.push('react-calendar__tile--past');
            }


            return classes.join(' ');
        }
        return null;
    };


    return (
        <div className="availability-calendar">
            <h2>Mark Your Availability</h2>
            <p>Click on dates to toggle your availability. Events you are part of are also shown.</p>
            <Calendar
                onChange={handleDateClick}
                value={null}
                selectRange={false}
                tileContent={tileContent}
                tileClassName={tileClassName}
                minDate={new Date()} // <--- ADDED THIS LINE
            />
            <div className="legend mt-3">
                <span className="legend-item available-legend"></span> Available
                <span className="legend-item events-legend"><Badge pill bg="info">N</Badge></span> Events
            </div>
        </div>
    );
}

export default AvailabilityCalendar;