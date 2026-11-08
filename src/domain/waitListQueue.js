/**
 * Points to the first person on the queue
 * Points to the last person on the queue
 * Tracks how many people are waiting
 */

export class Queue {
    #head = null;
    #tail = null;
    #size = 0;

// Adding a booking to the back of the waiting list
    enqueue(value) {
        const node = { value, next: null };

        if (this.#tail === null) {
            this.#head = node;
            this.#tail = node;
        } else {
            this.#tail.next = node;
            this.#tail = node;
        }

        this.#size++;
     }

// Remove the booking at the front
    dequeue() {
    if (this.#head === null) {
        return undefined;
    }

    const value = this.#head.value;

    this.#head = this.#head.next;
    this.#size--;

    if (this.#head === null) {
        this.#tail = null;
    }

    return value;
    }

//Checking booking next in line before calling forward
    peek() {
      return this.#head?.value;
    }

//Checks how many bookings are currently waiting in the queue
    get size() {
        return this.#size;
    }
}