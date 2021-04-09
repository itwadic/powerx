<template>
	<q-select
		v-model="sortBy"
		:options="options"
		emit-value
		map-options		
		outlined
		square
		label="Sort by"
		stack-label />
</template>

<script>
	import { mapState, mapActions } from 'vuex'
	import { LocalStorage } from 'quasar'

	export default {
		data () {
		  return {
		    options: [
		      {
		      	label: 'Title',
		      	value: 'title'
		      },
		      {
		      	label: 'Date Created',
		      	value: 'createdDate'
              },
		      {
		      	label: 'Date Due',
		      	value: 'dueBy'
			  },
		      {
		      	label: 'Priority',
		      	value: 'priority'
			  }			  
		    ]
		  }
		},
		computed: {
			...mapState('tasks', ['sort']),
			sortBy: {
				get() {					
					return this.sort ? this.sort : 'Title'
				},
				set(value) {
					this.$q.localStorage.set('sortKey', value)
					this.setSort(value)
				}
			}
		},
		methods: {
			...mapActions('tasks', ['setSort'])
		},
		mounted() {
			this.sortBy = this.$q.localStorage.getItem('sortKey')			
		}
	}
</script>

<style scoped>
	
</style>