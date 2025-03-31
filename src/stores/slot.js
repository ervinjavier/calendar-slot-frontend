import { defineStore } from 'pinia'
import axios from 'axios'

const api_url = import.meta.env.VITE_APP_URL

export const useSlotStore = defineStore('slot', {
  state: () => ({
    slots: [], // ✅ Ensure it's an array
  }),

  actions: {
    async getSlots() {
      this.loading = true
      try {
        const { data } = await axios.get(`${api_url}/slot`)
        this.slots = data.slots
      } catch (error) {
        console.error('Error fetching slots:', error)
      } finally {
        this.loading = false
      }
    },
    async bookAppointment(id) {
      this.loading = true
      try {
        const { data } = await axios.post(`${api_url}/slot/deduct`, {
          slot_id: id, // ✅ Attach selected date
        })

        console.log(data.slot)
        this.getSlots()

        // Update slots if needed
        // this.slots = data.slots;
      } catch (error) {
        console.error('Error deducting slot:', error)
      } finally {
        this.loading = false
      }
    },
  },
})
