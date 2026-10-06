"use client";

import { useEffect, useMemo, useState } from "react";
import { createVehicle, listVehicles, updateVehicle } from "./database.vehicles.services";
import { Vehicle, VehicleFormData, VehicleStatusFilter } from "../types/vehicles";
import { AlertError, AlertSuccess } from "@fretou/components";

export function useVehicles(driverId?: string) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleOpen, setVehicleOpen] = useState<Vehicle | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatusFilter>("todos");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const openModal = createModal || vehicleOpen !== null;

  function normalize(vehicle: Vehicle): Vehicle {
    return {
      ...vehicle,
      _id: String(vehicle._id),
      plate: vehicle.plate.trim().toUpperCase(),
      year: Number.isFinite(Number(vehicle.year)) ? Number(vehicle.year) : 0,
      totalLoad: Number.isFinite(Number(vehicle.totalLoad)) ? Number(vehicle.totalLoad) : 0,
      active: vehicle.active !== false,
    };
  }

  function toForm(vehicle: Vehicle): VehicleFormData {
    return {
      plate: vehicle.plate,
      model: vehicle.model,
      year: vehicle.year,
      totalLoad: vehicle.totalLoad,
      active: vehicle.active,
    };
  }

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      try {
        const list = await listVehicles(controller.signal, driverId);
        if (!active) return;
        setVehicles(list.map(normalize));
        setError("");
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar os veículos");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [driverId]);

  const filteredVehicles = useMemo(() => {
    const termo = search.trim().toLocaleLowerCase("pt-BR");

    return vehicles.filter((vehicle) => {
      if (driverId ? vehicle.thirdParty !== true : vehicle.thirdParty) return false;
      if (statusFilter === "ativos" && vehicle.active === false) return false;
      if (statusFilter === "inativos" && vehicle.active !== false) return false;
      if (!termo) return true;

      const plate = vehicle.plate.toLocaleLowerCase("pt-BR");
      const model = vehicle.model.toLocaleLowerCase("pt-BR");
      const year = String(vehicle.year);
      const load = String(vehicle.totalLoad);

      return plate.includes(termo) || model.includes(termo) || year.includes(termo) || load.includes(termo);
    });
  }, [vehicles, search, statusFilter, driverId]);

  function closeModal() {
    setCreateModal(false);
    setVehicleOpen(null);
  }

  async function saveVehicle(form: VehicleFormData) {
    const editing = vehicleOpen !== null;
    const controller = new AbortController();
    const payload: VehicleFormData = {
      plate: form.plate.trim().toUpperCase(),
      model: form.model,
      year: form.year,
      totalLoad: form.totalLoad,
      active: form.active,
    };

    try {
      if (vehicleOpen) {
        const updated = await updateVehicle(vehicleOpen._id, controller.signal, payload);
        setVehicles((current) =>
          current.map((vehicle) => (vehicle._id === vehicleOpen._id ? normalize(updated) : vehicle))
        );
      } else {
        const created = await createVehicle(controller.signal, payload);
        setVehicles((current) => [normalize(created), ...current]);
      }

      closeModal();
      AlertSuccess(editing ? "Veículo atualizado com sucesso." : "Veículo criado com sucesso.");
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível salvar o veículo.");
    }
  }

  async function toggleActive(vehicle: Vehicle) {
    const controller = new AbortController();
    const nextActive = vehicle.active === false;
    setTogglingId(vehicle._id);

    try {
      const updated = await updateVehicle(vehicle._id, controller.signal, {
        ...toForm(vehicle),
        active: nextActive,
      });
      setVehicles((current) =>
        current.map((item) => (item._id === vehicle._id ? normalize(updated) : item))
      );
      AlertSuccess(nextActive ? "Veículo ativado." : "Veículo desativado.");
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível atualizar o status do veículo.");
    } finally {
      setTogglingId(null);
    }
  }

  return {
    vehicles: filteredVehicles,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    setVehicleOpen,
    setCreateModal,
    openModal,
    closeModal,
    createModal,
    vehicleOpen,
    saveVehicle,
    toggleActive,
    togglingId,
    loading,
    error,
    ownFleet: Boolean(driverId),
  };
}
