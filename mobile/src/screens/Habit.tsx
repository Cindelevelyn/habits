import { Progressbar } from "../components/Progressbar";
import { BackButton } from "../components/BackButton";
import { ScrollView, View, Text, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Checkbox } from "../components/Checkbox";
import dayjs from 'dayjs'
import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import { api } from "../lib/axios";
import { generateProgressPercentage } from '../utils/genereta-progress-percentage'

interface Params {
  date: string
}

interface DayInfoProps {
  completedHabits: string[],
  possibleHabits: {
    id: string,
    title: string
  }[]
}

export function Habit() {
  const route = useRoute()
  const { date } = route.params as Params

  const parsedDate = dayjs(date)
  const dayOfWeek = parsedDate.format('dddd')
  const dayAndMonth = parsedDate.format('DD/MM')

  const [loading, setLoading] = useState(true)
  const [dayInfo, setDayInfo] = useState<DayInfoProps | null>(null)
  const [completedHabits, setCompletedHabits] = useState<string[]>([])

  const habitsProgress = dayInfo?.possibleHabits.length
    ? generateProgressPercentage(dayInfo.possibleHabits.length, completedHabits.length)
    : 0

  async function fetchHabit() {
    try {
      setLoading(true)

      const res = await api.get('/day', {
        params: { date }
      })
      setDayInfo(res.data)
      setCompletedHabits(res.data.completedHabits)

    } catch (error) {
      console.log(error);
      Alert.alert('Ops!', 'Não foi possível carregar as informações dos hábitos.')
    }
    finally {
      setLoading(false)
    }
  }

  async function handleToggleHabit(habitId: string) {
    if (completedHabits.includes(habitId)) {
      setCompletedHabits(prevState => prevState.filter(id => id !== habitId))
    }
    else {
      setCompletedHabits(prevState => [...prevState, habitId])
    }
  }

  useEffect(() => {
    fetchHabit()
  }, [])

  if (loading) {
    return (
      <Loading />
    )
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
          {dayOfWeek}
        </Text>
        <Text className="text-white font-extrabold text-3xl">
          {dayAndMonth}
        </Text>

        <Progressbar progress={habitsProgress} />

        <View className="mt-6">
          {dayInfo?.possibleHabits && dayInfo?.possibleHabits.map(habit => (
            < Checkbox
              key={habit.id}
              title={habit.title}
              checked={completedHabits.includes(habit.id)}
              onPress={() => handleToggleHabit(habit.id)}
            />
          ))
          }
        </View>

      </ScrollView>
    </View>
  )
}
