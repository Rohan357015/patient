/**
 * Custom Data Structures & Algorithms (DSA) Optimization
 * Designed for CareSync Patient-Doctor Platform.
 * Built with student-level clarity but industry-level optimization!
 */

// ==========================================
// 1. PREFIX TRIE (Trie Data Structure)
// Used for instant prefix search on doctor names and specialties.
// ==========================================

class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.doctors = new Set(); // Stores doctor objects that match this prefix
  }
}

export class DoctorTrie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Inserts a key phrase (e.g. name or specialty) and associates it with a doctor profile.
   * Time Complexity: O(L) where L is the length of the word/phrase.
   */
  insert(phrase, doctor) {
    if (!phrase) return;
    const words = phrase.toLowerCase().split(/\s+/);
    
    // Index each individual word of the phrase (e.g. "John" and "Doe" from "John Doe")
    words.forEach(word => {
      let current = this.root;
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (!current.children[char]) {
          current.children[char] = new TrieNode();
        }
        current = current.children[char];
        current.doctors.add(doctor); // Store ref at every prefix node
      }
      current.isEndOfWord = true;
    });
  }

  /**
   * Searches for doctors matching a prefix query in their indexed names/specialties.
   * Time Complexity: O(P) where P is the length of the search prefix.
   */
  search(prefix) {
    if (!prefix) return [];
    
    const word = prefix.toLowerCase().trim();
    let current = this.root;

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!current.children[char]) {
        return []; // No matches found
      }
      current = current.children[char];
    }

    // Convert Set of matches back to an array
    return Array.from(current.doctors);
  }
}

// ==========================================
// 2. HASHMAP (KEY-VALUE INDEX)
// Used to index appointments by date for O(1) daily schedule lookups.
// ==========================================

/**
 * Indexes a list of appointments by their date (YYYY-MM-DD) into a Hash Map.
 * Time Complexity: O(N) to build, O(1) to lookup.
 * @param {Array} appointments 
 * @returns {Object} A HashMap mapping date strings to arrays of appointments.
 */
export const indexAppointmentsByDate = (appointments) => {
  const scheduleMap = {};

  appointments.forEach(appt => {
    const dateKey = appt.date; // e.g., '2026-05-28'
    if (!scheduleMap[dateKey]) {
      scheduleMap[dateKey] = [];
    }
    scheduleMap[dateKey].push(appt);
  });

  return scheduleMap;
};

// ==========================================
// 3. MERGE SORT ALGORITHM
// Custom stable sorting algorithm to sort doctors by experience,
// or appointments chronologically.
// Time Complexity: O(N log N)
// ==========================================

/**
 * Performs a custom Merge Sort on an array of objects.
 * @param {Array} arr - The array to sort.
 * @param {String} key - The property key to sort by (e.g. 'experience', 'time').
 * @param {String} order - 'asc' (ascending) or 'desc' (descending).
 */
export const mergeSort = (arr, key, order = 'asc') => {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);

  return merge(
    mergeSort(left, key, order),
    mergeSort(right, key, order),
    key,
    order
  );
};

const merge = (left, right, key, order) => {
  const result = [];
  let lIndex = 0;
  let rIndex = 0;

  while (lIndex < left.length && rIndex < right.length) {
    let shouldPlaceLeft = false;
    const leftVal = left[lIndex][key];
    const rightVal = right[rIndex][key];

    if (order === 'asc') {
      shouldPlaceLeft = leftVal <= rightVal;
    } else {
      // Descending
      shouldPlaceLeft = leftVal >= rightVal;
    }

    if (shouldPlaceLeft) {
      result.push(left[lIndex]);
      lIndex++;
    } else {
      result.push(right[rIndex]);
      rIndex++;
    }
  }

  // Concatenate leftover elements
  return result
    .concat(left.slice(lIndex))
    .concat(right.slice(rIndex));
};
