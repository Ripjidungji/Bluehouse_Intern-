import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../ui/Card'
const data = [{day:'Mon', appointments:18}, {day:'Tue', appointments:24}, {day:'Wed', appointments:21}, {day:'Thu', appointments:27}, {day:'Fri', appointments:24}, {day:'Sat', appointments:12}]
export function AppointmentChart() { return <Card className="p-5"><h3 className="mb-5 font-bold">Appointments this week</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="day"/><YAxis/><Tooltip/><Bar dataKey="appointments" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></Card> }
