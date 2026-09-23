import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getTeams,
    getTeamMembers,
    createTeam,
    addTeamMember
} from '../../services/teamService';

import { getUsers } from '../../services/userService';

const Teams = () => {
    const { user } = useAuth();

    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [members, setMembers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newTeam, setNewTeam] = useState({
        name: '',
        description: ''
    });

    const [users, setUsers] = useState([]);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedMemberUserId, setSelectedMemberUserId] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    const loadTeams = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await getTeams();
            setTeams(data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Unable to load teams.'
            );
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
            setError('Unable to load users.');
        }
    };

    const handleViewMembers = async (team) => {
        try {
            setSelectedTeam(team);

            const data = await getTeamMembers(team.id);
            setMembers(data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Unable to load team members.'
            );
        }
    };

    const handleTeamChange = (e) => {
        const { name, value } = e.target;

        setNewTeam((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();

        try {
            setCreating(true);
            setError('');

            await createTeam(newTeam);

            setNewTeam({
                name: '',
                description: ''
            });

            setShowCreateModal(false);

            await loadTeams();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Unable to create team.'
            );
        } finally {
            setCreating(false);
        }
    };


    const handleAddMember = async (e) => {
        e.preventDefault();

        if (!selectedTeam || !selectedMemberUserId) {
            return;
        }

        try {
            setAddingMember(true);
            setError('');

            await addTeamMember(
                selectedTeam.id,
                Number(selectedMemberUserId)
            );

            const updatedMembers = await getTeamMembers(
                selectedTeam.id
            );

            setMembers(updatedMembers);

            setSelectedMemberUserId('');
            setShowAddMemberModal(false);

            await loadTeams();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Unable to add team member.'
            );
        } finally {
            setAddingMember(false);
        }
    };

    useEffect(() => {
        loadTeams();

        if (user?.role === 'Admin' || user?.role === 'Manager') {
            loadUsers();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border"></div>
                <p className="mt-2">Loading teams...</p>
            </div>
        );
    }

    return (
        <div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Teams</h2>
                    <p className="text-muted mb-0">
                        Manage your organization teams
                    </p>
                </div>

                {user?.role === 'Admin' && (
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <i className="bi bi-plus-lg me-2"></i>
                        Create Team
                    </button>
                )}
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="row g-4">

                {teams.length === 0 ? (
                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center py-5">
                                <i className="bi bi-people fs-1 text-muted"></i>

                                <h5 className="mt-3">
                                    No teams found
                                </h5>
                            </div>
                        </div>
                    </div>
                ) : (
                    teams.map((team) => (
                        <div
                            className="col-md-6 col-xl-4"
                            key={team.id}
                        >
                            <div className="card shadow-sm border-0 h-100">

                                <div className="card-body">

                                    <div className="d-flex justify-content-between">
                                        <h5>{team.name}</h5>

                                        <span className="badge text-bg-primary">
                                            {team.memberCount} members
                                        </span>
                                    </div>

                                    <p className="text-muted mt-2">
                                        {team.description ||
                                            'No description provided.'}
                                    </p>

                                    <small className="text-muted">
                                        Created by: {team.createdByName}
                                    </small>

                                    <div className="mt-4">

                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() =>
                                                handleViewMembers(team)
                                            }
                                        >
                                            <i className="bi bi-people me-1"></i>
                                            View Members
                                        </button>

                                    </div>

                                </div>

                            </div>
                        </div>
                    ))
                )}

            </div>

            {selectedTeam && (
                <div
                    className="modal d-block"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    {selectedTeam.name} — Members
                                </h5>
                                {(user?.role === 'Admin' || user?.role === 'Manager') && (
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => setShowAddMemberModal(true)}
                                    >
                                        <i className="bi bi-person-plus me-1"></i>
                                        Add Member
                                    </button>
                                )}
                                <button
                                    className="btn-close"
                                    onClick={() => {
                                        setSelectedTeam(null);
                                        setMembers([]);
                                    }}
                                ></button>

                            </div>

                            <div className="modal-body">

                                {members.length === 0 ? (
                                    <p className="text-muted">
                                        No members found.
                                    </p>
                                ) : (
                                    <div className="table-responsive">

                                        <table className="table align-middle">

                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Role</th>
                                                    <th>Joined</th>
                                                </tr>
                                            </thead>

                                            <tbody>

                                                {members.map((member) => (
                                                    <tr key={member.userId}>

                                                        <td>
                                                            {member.fullName}
                                                        </td>

                                                        <td>
                                                            {member.email}
                                                        </td>

                                                        <td>
                                                            <span className="badge text-bg-secondary">
                                                                {member.role}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            {new Date(
                                                                member.joinedAt
                                                            ).toLocaleDateString()}
                                                        </td>

                                                    </tr>
                                                ))}

                                            </tbody>

                                        </table>

                                    </div>
                                )}

                            </div>

                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div
                    className="modal d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Create Team
                                </h5>

                                <button
                                    className="btn-close"
                                    onClick={() => setShowCreateModal(false)}
                                ></button>
                            </div>

                            <form onSubmit={handleCreateTeam}>

                                <div className="modal-body">

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Team Name
                                        </label>
                                        
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={newTeam.name}
                                            onChange={handleTeamChange}
                                            maxLength="100"
                                            required
                                        />
                                    </div>

                                    

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            className="form-control"
                                            rows="4"
                                            value={newTeam.description}
                                            onChange={handleTeamChange}
                                            maxLength="500"
                                        ></textarea>
                                    </div>

                                </div>

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={creating}
                                    >
                                        {creating
                                            ? 'Creating...'
                                            : 'Create Team'}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                </div>
            )}

            {showAddMemberModal && (
                <div
                    className="modal d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Add Team Member
                                </h5>

                                <button
                                    className="btn-close"
                                    onClick={() => setShowAddMemberModal(false)}
                                ></button>
                            </div>

                            <form onSubmit={handleAddMember}>

                                <div className="modal-body">

                                    <label className="form-label">
                                        Select User
                                    </label>

                                    <select
                                        className="form-select"
                                        value={selectedMemberUserId}
                                        onChange={(e) =>
                                            setSelectedMemberUserId(e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select a user
                                        </option>

                                        {users
                                            .filter(
                                                (userItem) =>
                                                    !members.some(
                                                        (member) =>
                                                            member.userId === userItem.id
                                                    )
                                            )
                                            .map((userItem) => (
                                                <option
                                                    key={userItem.id}
                                                    value={userItem.id}
                                                >
                                                    {userItem.firstName}{' '}
                                                    {userItem.lastName} (
                                                    {userItem.role})
                                                </option>
                                            ))}
                                    </select>

                                </div>

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            setShowAddMemberModal(false)
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={addingMember}
                                    >
                                        {addingMember
                                            ? 'Adding...'
                                            : 'Add Member'}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Teams;