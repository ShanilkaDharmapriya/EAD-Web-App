import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ownersAPI } from '../../api/owners'
import { useToast } from '../../hooks/useToast'
import Card from '../../components/UI/Card'
import Table from '../../components/UI/Table'
import Button from '../../components/UI/Button'
import Badge from '../../components/UI/Badge'
import Select from '../../components/UI/Select'
import Pagination from '../../components/UI/Pagination'
import { 
  PlusIcon,
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  TruckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const OwnersList = () => {
  const { showToast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const pageSize = 10

  const { data: owners, isLoading } = useQuery({
    queryKey: ['owners', { page: currentPage, size: pageSize, search: searchTerm }],
    queryFn: () => ownersAPI.getOwners({ 
      page: currentPage, 
      size: pageSize, 
      search: searchTerm 
    })
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">EV Owners</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view all registered EV owners
          </p>
        </div>
        <Link to="/owners/new">
          <Button className="flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Add Owner</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Owners Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <Table>
              <Table.Header>
                <tr>
                  <Table.Head>Owner</Table.Head>
                  <Table.Head>Contact</Table.Head>
                  <Table.Head>Vehicle</Table.Head>
                  <Table.Head>Battery</Table.Head>
                  <Table.Head>Charging Type</Table.Head>
                  <Table.Head>Registered</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </tr>
              </Table.Header>
              <Table.Body>
                {owners?.data?.map((owner) => (
                  <Table.Row key={owner.nic}>
                    <Table.Cell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <UserGroupIcon className="h-4 w-4 text-primary-600" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{owner.fullName}</p>
                          <p className="text-sm text-gray-500">NIC: {owner.nic}</p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{owner.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{owner.phoneNumber}</span>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <TruckIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">{owner.vehicleType}</p>
                          <p className="text-sm text-gray-500">{owner.licensePlate}</p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-900">{owner.batteryCapacity} kWh</span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant="info">{owner.chargingType}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-500">
                        {new Date(owner.createdAt).toLocaleDateString()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/owners/${owner.nic}`}
                          className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                        >
                          View
                        </Link>
                        <Link
                          to={`/owners/${owner.nic}/edit`}
                          className="text-gray-600 hover:text-gray-500 text-sm font-medium"
                        >
                          Edit
                        </Link>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            {owners?.data?.length === 0 && (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No owners found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search criteria' 
                    : 'Get started by adding a new owner'
                  }
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <Link to="/owners/new">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Owner
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {owners?.pagination && owners.pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={owners.pagination.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default OwnersList
