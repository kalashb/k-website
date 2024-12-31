import db from './db'
import bcrypt from 'bcrypt'

export async function addUser(username: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await db.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    )
    return result.rows[0]
  } catch (error) {
    console.error('Error adding user:', error)
    throw error
  }
}

export async function getUser(username: string, password: string) {
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username])
    if (result.rows.length > 0) {
      const user = result.rows[0]
      const match = await bcrypt.compare(password, user.password)
      if (match) {
        return { id: user.id, username: user.username }
      }
    }
    return null
  } catch (error) {
    console.error('Error getting user:', error)
    throw error
  }
}

export async function createTeam(name: string, course: string, creatorId: number) {
  const result = await db.query(
    'INSERT INTO teams (name, course, creator_id) VALUES ($1, $2, $3) RETURNING id',
    [name, course, creatorId]
  )
  const teamId = result.rows[0].id
  await db.query(
    'INSERT INTO team_members (team_id, user_id, status) VALUES ($1, $2, $3)',
    [teamId, creatorId, 'approved']
  )
  return { id: teamId, name, course, creator_id: creatorId }
}

export async function getTeams() {
  const result = await db.query(`
    SELECT t.*, 
           array_agg(tm.user_id) FILTER (WHERE tm.status = 'approved') as members,
           array_agg(tm.user_id) FILTER (WHERE tm.status = 'pending') as pending_requests
    FROM teams t
    LEFT JOIN team_members tm ON t.id = tm.team_id
    GROUP BY t.id
  `)
  return result.rows
}

export async function getTeamsByMember(userId: number) {
  const result = await db.query(`
    SELECT t.*, 
           array_agg(tm.user_id) FILTER (WHERE tm.status = 'approved') as members,
           array_agg(tm.user_id) FILTER (WHERE tm.status = 'pending') as pending_requests
    FROM teams t
    LEFT JOIN team_members tm ON t.id = tm.team_id
    WHERE t.id IN (SELECT team_id FROM team_members WHERE user_id = $1)
    GROUP BY t.id
  `, [userId])
  return result.rows
}

export async function joinTeamRequest(teamId: number, userId: number) {
  await db.query(
    'INSERT INTO team_members (team_id, user_id, status) VALUES ($1, $2, $3)',
    [teamId, userId, 'pending']
  )
}

export async function approveJoinRequest(teamId: number, userId: number) {
  await db.query(
    'UPDATE team_members SET status = $1 WHERE team_id = $2 AND user_id = $3',
    ['approved', teamId, userId]
  )
}

export async function denyJoinRequest(teamId: number, userId: number) {
  await db.query(
    'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
    [teamId, userId]
  )
}

export async function getCourses() {
  const result = await db.query('SELECT * FROM courses')
  return result.rows
}

