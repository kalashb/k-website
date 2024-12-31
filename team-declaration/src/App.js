import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, UserPlus, X, Check } from 'lucide-react';

const COURSES = ['A', 'B', 'C', 'D'];

const App = () => {
  // State management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userDescription, setUserDescription] = useState('');
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState({
    course: '',
    section: '',
    description: ''
  });

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
      if (!userProfile) {
        setUserProfile({ email, name: '', description: '' });
      }
    }
  };

  // Profile setup handler
  const handleProfileSetup = (e) => {
    e.preventDefault();
    setUserProfile({ ...userProfile, name: userName, description: userDescription });
  };

  // Team creation handler
  const handleCreateTeam = (e) => {
    e.preventDefault();
    const team = {
      ...newTeam,
      id: Date.now(),
      creator: userProfile,
      members: [],
      requests: [],
    };
    setTeams([...teams, team]);
    setNewTeam({ course: '', section: '', description: '' });
  };

  // Join team request handler
  const handleJoinRequest = (teamId) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          requests: [...team.requests, userProfile]
        };
      }
      return team;
    }));
  };

  // Request approval/denial handler
  const handleRequest = (teamId, requestUser, isApproved) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        const newRequests = team.requests.filter(req => req.email !== requestUser.email);
        const newMembers = isApproved ?
          [...team.members, requestUser] :
          team.members;
        return {
          ...team,
          requests: newRequests,
          members: newMembers
        };
      }
      return team;
    }));
  };

  // Team deletion handler
  const handleDeleteTeam = (teamId) => {
    setTeams(teams.filter(team => team.id !== teamId));
  };

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Please login to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userProfile && (!userProfile.name || !userProfile.description)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Complete Profile</CardTitle>
            <CardDescription>Please provide your details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSetup} className="space-y-4">
              <Input
                placeholder="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <Textarea
                placeholder="Brief description about yourself"
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
              />
              <Button type="submit" className="w-full">Save Profile</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome, {userProfile.name}</CardTitle>
            <CardDescription>{userProfile.description}</CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Team</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <Select
                value={newTeam.course}
                onValueChange={(value) => setNewTeam({ ...newTeam, course: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  {COURSES.map(course => (
                    <SelectItem key={course} value={course}>
                      Course {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Section"
                value={newTeam.section}
                onChange={(e) => setNewTeam({ ...newTeam, section: e.target.value })}
              />
              <Textarea
                placeholder="Team Description"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
              />
              <Button type="submit">Create Team</Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle>{team.course} - {team.section}</CardTitle>
                <CardDescription>{team.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Created by:</h4>
                    <Card>
                      <CardContent className="p-4">
                        <p className="font-medium">{team.creator.name}</p>
                        <p className="text-sm text-gray-500">{team.creator.description}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {team.members.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Team Members:</h4>
                      <div className="space-y-2">
                        {team.members.map(member => (
                          <Card key={member.email}>
                            <CardContent className="p-4">
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-gray-500">{member.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {team.creator.email === userProfile.email && team.requests.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Join Requests:</h4>
                      <div className="space-y-2">
                        {team.requests.map(request => (
                          <Card key={request.email}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{request.name}</p>
                                  <p className="text-sm text-gray-500">{request.description}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleRequest(team.id, request, true)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRequest(team.id, request, false)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {team.creator.email !== userProfile.email && (
                  <Button
                    onClick={() => handleJoinRequest(team.id)}
                    disabled={team.requests.some(req => req.email === userProfile.email) ||
                      team.members.some(member => member.email === userProfile.email)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Join Team
                  </Button>
                )}

                {team.creator.email === userProfile.email && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Team</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the team
                          and remove all members.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTeam(team.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;