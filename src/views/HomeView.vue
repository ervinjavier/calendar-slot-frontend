<template>
  <main class="flex h-screen justify-center items-center">
    <div v-if="loading">Loading slots...</div>
    <div v-else>
      <div v-if="slots.length">
        <DatePicker
          ref="calendar"
          v-model="selectedDate"
          :model-config="{ type: 'string', mask: 'YYYY-MM-DD' }"
          @update:model-value="updateSelectedDate"
          :attributes="attributes"
          :select-attribute="selectAttribute"
          is-inline
          expanded
        >
          <!-- Footer Slot -->
          <template #footer>
            <div class="px-2">
              <button @click="setToday" class="btn btn-primary btn-sm text-sm w-full mt-3 mb-3">
                Today
              </button>
            </div>
          </template>
        </DatePicker>

        <!--  -->
        <div v-if="filteredSlots.length">
          <div class="mt-3">
            <fieldset class="border border-gray-300 p-4 rounded flex flex-col gap-2">
              <legend class="font-semibold">Time Slots</legend>

              <div v-for="slot in filteredSlots" :key="slot.id">
                <p v-if="slot.capacity > 0">
                  <input
                    v-model="time"
                    type="radio"
                    name="timeSlot"
                    :value="slot.id"
                    :id="slot.id"
                    class="radio"
                  />
                  <label :for="slot.id" class="cursor-pointer px-2"
                    >{{ formatTime(slot.start) }} - {{ formatTime(slot.end) }} | Slot:
                    {{ slot.capacity }}
                  </label>
                </p>
                <p class="text-gray-400" v-else>
                  <input
                    v-model="time"
                    type="radio"
                    name="timeSlot"
                    :value="slot.id"
                    :id="slot.id"
                    class="radio"
                    disabled
                  />
                  <label :for="slot.id" class="cursor-pointer px-2"
                    >{{ formatTime(slot.start) }} - {{ formatTime(slot.end) }} | Fully Booked
                  </label>
                </p>
              </div>
            </fieldset>

            <div v-if="selectedDate && time" class="mt-5">
              <button @click="slotStore.bookAppointment(time)" class="btn btn-primary w-full">
                Book an appointment
              </button>
            </div>
          </div>
        </div>
        <div v-else></div>
      </div>
      <div v-else>No slots available.</div>
    </div>
  </main>
</template>

<script setup>
import { useSlotStore } from '@/stores/slot'
import { onMounted, ref, computed, watchEffect, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { DatePicker } from 'v-calendar'
import { format } from 'date-fns'

const slotStore = useSlotStore()
const { slots } = storeToRefs(slotStore)
const loading = ref(true)
const selectedDate = ref('') // ✅ Default to today
const time = ref()

onMounted(async () => {
  loading.value = true
  await slotStore.getSlots()
  loading.value = false
})

const calendar = ref(null)

const selectAttribute = ref({
  highlight: {
    color: 'green', // ✅ White dot
    fillMode: 'outline', // Ensures the dot is fully colored
  },
})

const attributes = computed(() => {
  const dateAttributes = {}

  // Group slots by date and calculate total capacity per date
  const capacityByDate = slots.value.reduce((acc, slot) => {
    acc[slot.date] = (acc[slot.date] || 0) + Number(slot.capacity) // ✅ Ensure capacity is a number
    return acc
  }, {})

  // Assign colors, disable status, and popover labels based on total capacity
  Object.keys(capacityByDate).forEach((date) => {
    const totalCapacity = capacityByDate[date]

    dateAttributes[date] = {
      key: `slot-${date}`,
      highlight: {
        color: totalCapacity > 0 ? 'green' : 'red', // Green if available, Red if fully booked
        fillMode: 'light',
      },
      dates: date,
      disabled: totalCapacity === 0, // Disable if fully booked
      popover: {
        label: `Available Slots: ${totalCapacity}`, // ✅ Show capacity for this date
      },
    }
  })

  return Object.values(dateAttributes)
})

// ✅ Ensure DatePicker updates selectedDate correctly
const updateSelectedDate = (newDate) => {
  if (newDate instanceof Date) {
    selectedDate.value = format(newDate, 'yyyy-MM-dd') // Convert Date to "YYYY-MM-DD"
  } else {
    selectedDate.value = String(newDate) // Ensure it's a string
  }
}

const filteredSlots = computed(() => {
  return slots.value.filter((slot) => slot.date === selectedDate.value)
})

const formatTime = (time) => time.slice(0, 5)

watchEffect(() => {
  console.log('Loaded Slots:', slots.value)
  console.log('Selected Date:', selectedDate.value)
  console.log('Filtered Slots:', filteredSlots.value)
})

watch(selectedDate, () => {
  time.value = null // ✅ Reset the selected time when date changes
})

function setToday() {
  // selectedDate.value = format(new Date(), 'yyyy-MM-dd') // ✅ Updates the calendar
  calendar.value.move(format(new Date(), 'yyyy-MM-dd'))
  selectedDate.value = format(new Date(), 'yyyy-MM-dd')
}
</script>
